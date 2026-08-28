import { v } from "convex/values";
import { internalMutation } from "./_generated/server.js";

/**
 * Empties the whole catalogue so `seed:run` can repopulate a deployment from
 * `lib/catalog-seed.ts`:
 *
 *   npx convex run reset:wipe '{"confirm":"wipe"}'            # dev
 *   npx convex run reset:wipe '{"confirm":"wipe"}' --prod     # production
 *
 * `seed:run` is idempotent by slug, so it will not re-create anything while
 * the old rows are still there — that is what this is for. It deletes every
 * row in every table, orders and the daily order-number counters included:
 * orders reference products by `productId`, so leaving them behind next to a
 * re-seeded catalogue is the one state worse than an empty database.
 *
 * Uploaded product photographs are deleted from Convex file storage too. A
 * seeded product's image is a file under `public/catalogue/` and has no
 * `imageStorageId`; only admin uploads have one, and nothing else in the app
 * would ever reference the blob again.
 *
 * `internalMutation` keeps this off the public API — reachable from the CLI
 * only, never from a browser. The `confirm` argument exists so that a stray
 * `npx convex run reset:wipe` cannot do it by accident.
 *
 * There is no undo. Run `npx convex export --path backup.zip` first if the
 * deployment holds anything real.
 */
export const wipe = internalMutation({
  args: { confirm: v.literal("wipe") },
  handler: async (ctx) => {
    let storageBlobs = 0;
    let products = 0;
    for (const product of await ctx.db.query("products").collect()) {
      if (product.imageStorageId) {
        await ctx.storage.delete(product.imageStorageId);
        storageBlobs++;
      }
      await ctx.db.delete(product._id);
      products++;
    }

    let categories = 0;
    for (const doc of await ctx.db.query("categories").collect()) {
      await ctx.db.delete(doc._id);
      categories++;
    }

    let orders = 0;
    for (const doc of await ctx.db.query("orders").collect()) {
      await ctx.db.delete(doc._id);
      orders++;
    }

    let counters = 0;
    for (const doc of await ctx.db.query("counters").collect()) {
      await ctx.db.delete(doc._id);
      counters++;
    }

    return { products, categories, orders, counters, storageBlobs };
  },
});
