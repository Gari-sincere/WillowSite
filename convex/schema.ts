import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),
  generacUploads: defineTable({
    storageId: v.id("_storage"),
    filename: v.string(),
  }),
});
