import { v } from "convex/values";
import { query } from "./_generated/server.js";
import { isLive, toCategory, toProduct } from "./model.js";

/**
 * Public, read-only catalogue queries.
 *
 * These are deliberately public — they return exactly what the storefront
 * already renders to anyone who loads the site. Nothing here reads or writes
 * anything a visitor could not see. Every *write* lives in `admin.ts` behind a
 * shared secret; see DECISIONS.md.
 *
 * In practice the browser never calls these either: `lib/catalog.ts` reads them
 * server-side so the catalogue stays out of the client bundle, which is what
 * keeps the first-load JS budget where it is.
 */

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("categories").collect();
    return docs
      .map(toCategory)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("products").collect();
    return docs
      .filter(isLive)
      .map(toProduct)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const productBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const doc = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return doc && isLive(doc) ? toProduct(doc) : null;
  },
});

export const productById = query({
  args: { productId: v.string() },
  handler: async (ctx, { productId }) => {
    const doc = await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("productId", productId))
      .unique();
    return doc && isLive(doc) ? toProduct(doc) : null;
  },
});

export const categoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const doc = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return doc ? toCategory(doc) : null;
  },
});

export const productsInCategory = query({
  args: { categorySlug: v.string() },
  handler: async (ctx, { categorySlug }) => {
    const docs = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categorySlug", categorySlug))
      .collect();
    return docs
      .filter(isLive)
      .map(toProduct)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});
