import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user settings
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return settings || {
      currency: "JPY",
      monthStartDay: 25,
      isAdmin: false,
    };
  },
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    currency: v.string(),
    monthStartDay: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        currency: args.currency,
        monthStartDay: args.monthStartDay,
      });
    } else {
      return await ctx.db.insert("userSettings", {
        userId,
        currency: args.currency,
        monthStartDay: args.monthStartDay,
      });
    }
  },
});

// Initialize user settings (called after registration)
export const initializeUserSettings = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) {
      return await ctx.db.insert("userSettings", {
        userId,
        currency: "JPY",
        monthStartDay: 25,
        isAdmin: false,
      });
    }

    return existing;
  },
});
