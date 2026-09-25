import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const uploadListItem = v.object({
  _id: v.id("generacUploads"),
  _creationTime: v.number(),
  filename: v.string(),
  contentType: v.union(v.string(), v.null()),
  size: v.union(v.number(), v.null()),
  url: v.union(v.string(), v.null()),
});

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

export const list = query({
  args: {},
  returns: v.array(uploadListItem),
  handler: async (ctx) => {
    const uploads = await ctx.db.query("generacUploads").order("desc").take(50);
    return await Promise.all(
      uploads.map(async (upload) => {
        const metadata = await ctx.db.system.get("_storage", upload.storageId);
        return {
          _id: upload._id,
          _creationTime: upload._creationTime,
          filename: upload.filename,
          contentType: metadata?.contentType ?? null,
          size: metadata?.size ?? null,
          url: await ctx.storage.getUrl(upload.storageId),
        };
      }),
    );
  },
});
