import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  expenses: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    category: v.string(),
    description: v.optional(v.string()), // Made optional
    date: v.string(), // YYYY-MM-DD format
    periodId: v.optional(v.id("periods")), // Link to a period
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_date", ["date"])
    .index("by_user_and_period", ["userId", "periodId"]),

  periods: defineTable({
    userId: v.id("users"),
    name: v.string(),
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(), // YYYY-MM-DD format
    isClosed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "isClosed"]),

  userSettings: defineTable({
    userId: v.id("users"),
    currency: v.string(),
    monthStartDay: v.number(), // 1-28, default 25
    isAdmin: v.optional(v.boolean()),
    currentPeriodId: v.optional(v.id("periods")), // Reference to the current active period
    primaryColor: v.optional(v.string()), // Primary theme color
  })
    .index("by_user", ["userId"])
    .index("by_admin", ["isAdmin"]),
    
  userCategories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
