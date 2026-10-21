import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user's expenses
export const getUserExpenses = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.startDate && args.endDate) {
      query = ctx.db
        .query("expenses")
        .withIndex("by_user_and_date", (q) => 
          q.eq("userId", userId).gte("date", args.startDate!).lte("date", args.endDate!)
        );
    }

    return await query.order("desc").collect();
  },
});

// Get expenses for a specific date
export const getExpensesByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("expenses")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .order("desc")
      .collect();
  },
});

// Add new expense
export const addExpense = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    description: v.optional(v.string()), // Made optional
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("expenses", {
      userId,
      amount: args.amount,
      category: args.category,
      description: args.description || "",
      date: args.date,
      createdAt: Date.now(),
    });
  },
});

// Update expense
export const updateExpense = mutation({
  args: {
    id: v.id("expenses"),
    amount: v.number(),
    category: v.string(),
    description: v.optional(v.string()), // Made optional
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) {
      throw new Error("Expense not found or unauthorized");
    }

    return await ctx.db.patch(args.id, {
      amount: args.amount,
      category: args.category,
      description: args.description || "",
      date: args.date,
    });
  },
});

// Delete expense
export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) {
      throw new Error("Expense not found or unauthorized");
    }

    return await ctx.db.delete(args.id);
  },
});

// Get spending analytics with full month data
export const getSpendingAnalytics = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { totalSpending: 0, categoryBreakdown: [], dailySpending: [] };

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Category breakdown
    const categoryMap = new Map<string, number>();
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    // Generate all dates in range for complete daily spending data
    const dailyMap = new Map<string, number>();
    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);
    
    // Initialize all dates with 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, 0);
    }
    
    // Fill in actual spending data
    expenses.forEach(expense => {
      dailyMap.set(expense.date, (dailyMap.get(expense.date) || 0) + expense.amount);
    });
    
    const dailySpending = Array.from(dailyMap.entries()).map(([date, amount]) => ({
      date,
      amount,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSpending,
      categoryBreakdown,
      dailySpending,
    };
  },
});
