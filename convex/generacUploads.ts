import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const save = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
  },
  returns: v.id("generacUploads"),
  handler: async (ctx, args) => {
    const metadata = await ctx.db.system.get("_storage", args.storageId);
    if (metadata === null) {
      throw new Error("Uploaded file was not found in storage");
    }
    return await ctx.db.insert("generacUploads", {
      storageId: args.storageId,
      filename: args.filename,
    });
  },
});
