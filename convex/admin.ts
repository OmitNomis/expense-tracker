import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all users and their spending data (admin only)
export const getAllUsersSpending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is admin
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userSettings?.isAdmin) {
      throw new Error("Admin access required");
    }

    // Get all users
    const users = await ctx.db.query("users").collect();
    
    // Get all expenses
    const allExpenses = await ctx.db.query("expenses").collect();

    // Group expenses by user
    const userSpendingMap = new Map();
    
    users.forEach(user => {
      userSpendingMap.set(user._id, {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        expenses: [],
        totalSpending: 0,
      });
    });

    allExpenses.forEach(expense => {
      const userData = userSpendingMap.get(expense.userId);
      if (userData) {
        userData.expenses.push(expense);
        userData.totalSpending += expense.amount;
      }
    });

    return Array.from(userSpendingMap.values());
  },
});
