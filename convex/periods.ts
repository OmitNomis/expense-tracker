import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all periods for the current user
export const getUserPeriods = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("periods")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get the current active period
export const getCurrentPeriod = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // First check if there's a current period in user settings
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userSettings?.currentPeriodId) {
      const currentPeriod = await ctx.db.get(userSettings.currentPeriodId);
      if (currentPeriod && !currentPeriod.isClosed) {
        return currentPeriod;
      }
    }

    // If no current period or it's closed, find the most recent open period
    const openPeriods = await ctx.db
      .query("periods")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("isClosed", false)
      )
      .order("desc")
      .collect();

    return openPeriods.length > 0 ? openPeriods[0] : null;
  },
});

// Start a new period
export const startNewPeriod = mutation({
  args: {
    name: v.string(),
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Close any existing open periods
    const openPeriods = await ctx.db
      .query("periods")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("isClosed", false)
      )
      .collect();

    for (const period of openPeriods) {
      await ctx.db.patch(period._id, { isClosed: true });
    }

    // Create new period
    const newPeriodId = await ctx.db.insert("periods", {
      userId,
      name: args.name,
      startDate: args.startDate,
      endDate: "", // Will be set when closed
      isClosed: false,
      createdAt: Date.now(),
    });

    // Update user settings to point to the new period
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userSettings) {
      await ctx.db.patch(userSettings._id, { currentPeriodId: newPeriodId });
    }

    return newPeriodId;
  },
});

// Close a period
export const closePeriod = mutation({
  args: {
    periodId: v.id("periods"),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const period = await ctx.db.get(args.periodId);
    if (!period || period.userId !== userId) {
      throw new Error("Period not found or unauthorized");
    }

    if (period.isClosed) {
      throw new Error("Period is already closed");
    }

    // Close the period
    await ctx.db.patch(args.periodId, {
      endDate: args.endDate,
      isClosed: true,
    });

    // Remove from user settings if it's the current period
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userSettings && userSettings.currentPeriodId === args.periodId) {
      await ctx.db.patch(userSettings._id, { currentPeriodId: undefined });
    }

    return args.periodId;
  },
});

// Update period details (name, dates)
export const updatePeriod = mutation({
  args: {
    periodId: v.id("periods"),
    name: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const period = await ctx.db.get(args.periodId);
    if (!period || period.userId !== userId) {
      throw new Error("Period not found or unauthorized");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) {
      updates.endDate = args.endDate;
      // If setting an end date, mark as closed
      if (args.endDate && !period.isClosed) {
        updates.isClosed = true;
      }
      // If removing end date, mark as open
      if (!args.endDate && period.isClosed) {
        updates.isClosed = false;
      }
    }

    await ctx.db.patch(args.periodId, updates);
    return args.periodId;
  },
});

// Reopen a closed period
export const reopenPeriod = mutation({
  args: {
    periodId: v.id("periods"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const period = await ctx.db.get(args.periodId);
    if (!period || period.userId !== userId) {
      throw new Error("Period not found or unauthorized");
    }

    await ctx.db.patch(args.periodId, {
      isClosed: false,
      endDate: "",
    });

    return args.periodId;
  },
});

// Delete a period
export const deletePeriod = mutation({
  args: {
    periodId: v.id("periods"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const period = await ctx.db.get(args.periodId);
    if (!period || period.userId !== userId) {
      throw new Error("Period not found or unauthorized");
    }

    // Remove period reference from user settings if it's the current period
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userSettings && userSettings.currentPeriodId === args.periodId) {
      await ctx.db.patch(userSettings._id, { currentPeriodId: undefined });
    }

    // Update all expenses in this period to have no period
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("periodId"), args.periodId))
      .collect();

    for (const expense of expenses) {
      await ctx.db.patch(expense._id, { periodId: undefined });
    }

    // Delete the period
    await ctx.db.delete(args.periodId);
    return args.periodId;
  },
});
