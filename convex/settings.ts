import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

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

    // Get user categories
    const categories = await ctx.db
      .query("userCategories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      ...(settings || {
        currency: "JPY",
        monthStartDay: 25,
        isAdmin: false,
        primaryColor: "#FFD600",
      }),
      categories: categories.length > 0 ? categories : null,
    };
  },
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    currency: v.string(),
    monthStartDay: v.number(),
    primaryColor: v.optional(v.string()),
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
        ...(args.primaryColor && { primaryColor: args.primaryColor }),
      });
    } else {
      return await ctx.db.insert("userSettings", {
        userId,
        currency: args.currency,
        monthStartDay: args.monthStartDay,
        ...(args.primaryColor && { primaryColor: args.primaryColor }),
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
        primaryColor: "#FFD600",
      });
    }

    return existing;
  },
});

// Add a new category
export const addUserCategory = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("userCategories", {
      userId,
      name: args.name,
      color: args.color,
      createdAt: Date.now(),
    });
  },
});

// Update a category
export const updateUserCategory = mutation({
  args: {
    id: v.id("userCategories"),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    return await ctx.db.patch(args.id, {
      name: args.name,
      color: args.color,
    });
  },
});

// Delete a category
export const deleteUserCategory = mutation({
  args: {
    id: v.id("userCategories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    return await ctx.db.delete(args.id);
  },
});

// Get user categories
export const getUserCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("userCategories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
