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
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_date", ["date"]),
  
  userSettings: defineTable({
    userId: v.id("users"),
    currency: v.string(),
    monthStartDay: v.number(), // 1-28, default 25
    isAdmin: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_admin", ["isAdmin"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
