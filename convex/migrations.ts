import { internalMutation } from "./_generated/server.js";

/**
 * Strips the fields that no longer exist on a product or an order line:
 * `material`, `careInstructions` and `colors` on products, and `colors` and
 * `color` on the item snapshots inside an order.
 *
 *   npx convex run migrations:dropColoursAndCare
 *
 * Convex validates the schema against the documents already in the tables on
 * every push, so a deployment cannot simply forget a field: rows that still
 * carry it are rejected. That makes this a three-step change, and the order
 * matters:
 *
 *   1. Push with those fields still declared, but wrapped in `v.optional(...)`
 *      in `convex/schema.ts`. Existing rows satisfy an optional field, so the
 *      push goes through and this function lands on the deployment.
 *   2. Run the command above. It rewrites every product and every order.
 *   3. Push again with `convex/schema.ts` as it is now — the fields gone
 *      entirely. Nothing is carrying them any more, so it validates.
 *
 * Orders are a permanent record, so this is not reversible: a colour a
 * customer chose last month is gone once this runs. Everything that priced the
 * order — the product, the quantity, the size, the unit price and the tier —
 * is untouched.
 *
 * `internalMutation` is not part of the public API. It cannot be reached from
 * a browser at all, only from the CLI, which is why it needs no secret.
 *
 * Running it twice is harmless: the second pass finds nothing to strip.
 */
export const dropColoursAndCare = internalMutation({
  args: {},
  handler: async (ctx) => {
    let products = 0;
    for (const doc of await ctx.db.query("products").collect()) {
      // `_id` and `_creationTime` are Convex's own and cannot be patched, so
      // the replacement is built from the rest of the document.
      const rest = { ...doc } as Record<string, unknown>;
      const _id = doc._id;
      delete rest._id;
      delete rest._creationTime;

      if (
        !("material" in rest) &&
        !("careInstructions" in rest) &&
        !("colors" in rest)
      ) {
        continue;
      }

      delete rest.material;
      delete rest.careInstructions;
      delete rest.colors;

      // `replace` rather than `patch`: patching cannot remove a field.
      await ctx.db.replace(_id, rest as never);
      products++;
    }

    let orders = 0;
    for (const doc of await ctx.db.query("orders").collect()) {
      const items = doc.items as unknown as Record<string, unknown>[];
      if (!items.some((item) => "colors" in item || "color" in item)) continue;

      await ctx.db.patch(doc._id, {
        items: items.map((item) => {
          const next = { ...item };
          delete next.colors;
          delete next.color;
          return next;
        }) as never,
      });
      orders++;
    }

    return { products, orders };
  },
});

/**
 * Strips `description` from every category.
 *
 *   npx convex run migrations:dropCategoryDescription
 *
 * A rail is a photograph and a name; the card carries a counted piece count
 * where the paragraph used to be. Nothing reads the field any more, so this is
 * only tidying the rows.
 *
 * Same three steps as `dropColoursAndCare`, and the first one is already done:
 * `convex/schema.ts` declares `description` as `v.optional(v.string())`, so a
 * push lands with the old rows intact. Run the command above, then delete that
 * line from the schema and push again.
 *
 * Running it twice is harmless: the second pass finds nothing to strip.
 */
export const dropCategoryDescription = internalMutation({
  args: {},
  handler: async (ctx) => {
    let categories = 0;
    for (const doc of await ctx.db.query("categories").collect()) {
      const rest = { ...doc } as Record<string, unknown>;
      const _id = doc._id;
      delete rest._id;
      delete rest._creationTime;

      if (!("description" in rest)) continue;
      delete rest.description;

      // `replace` rather than `patch`: patching cannot remove a field.
      await ctx.db.replace(_id, rest as never);
      categories++;
    }
    return { categories };
  },
});
