import { internalMutation } from "./_generated/server.js";
import { CATEGORY_SEEDS, PRODUCT_SEEDS } from "../lib/catalog-seed";

/**
 * One-shot population of a fresh deployment:
 *
 *   npx convex run seed:run
 *
 * `internalMutation` is not part of the public API — it cannot be called from a
 * browser at all, only from the CLI or another Convex function. That is why it
 * needs no secret of its own.
 *
 * It is idempotent by slug: rows that already exist are left alone, so running
 * it twice will not duplicate the catalogue or overwrite an admin's edits.
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    let categories = 0;
    for (const category of CATEGORY_SEEDS) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("categories", category);
      categories++;
    }

    let products = 0;
    for (const product of PRODUCT_SEEDS) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", product.slug))
        .unique();
      if (existing) continue;

      const { id, image, ...rest } = product;
      await ctx.db.insert("products", {
        ...rest,
        productId: id,
        imageSrc: image.src,
        imageAlt: image.alt,
        isArchived: false,
      });
      products++;
    }

    return { categories, products };
  },
});

/**
 * Removes the orders left behind by a concurrency probe:
 *
 *   npx convex run seed:clearTestOrders
 *
 * Internal, so it is unreachable from a browser. Matches on the probe's exact
 * customer names — it will never touch a real order.
 */
export const clearTestOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const names = new Set(["Concurrency Probe", "Test Buyer"]);
    const orders = await ctx.db.query("orders").collect();
    let removed = 0;
    for (const order of orders) {
      if (!names.has(order.customer.name)) continue;
      await ctx.db.delete(order._id);
      removed++;
    }
    return { removed };
  },
});
