import { v } from "convex/values";
import { unitPriceFor } from "../lib/pricing";
import { mutation, query } from "./_generated/server.js";
import { isLive, toOrder } from "./model.js";

/**
 * Order creation, priced and numbered inside one Convex transaction.
 *
 * The client sends product ids and quantities. It does not send prices, and if
 * it did they would be ignored — every naira here is recomputed from the
 * products table. Convex mutations are serializable, so the counter
 * read-modify-write below is atomic on its own; the promise lock the
 * file-backed stand-in needed is gone.
 */

function dateKey(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export const create = mutation({
  args: {
    fulfilment: v.union(v.literal("pickup"), v.literal("delivery")),
    customer: v.object({
      name: v.string(),
      phone: v.string(),
      whatsapp: v.string(),
    }),
    pickup: v.optional(
      v.object({ preferredDate: v.string(), preferredTime: v.string() }),
    ),
    delivery: v.optional(
      v.object({
        state: v.string(),
        city: v.string(),
        address: v.string(),
        landmark: v.string(),
        preferredDate: v.string(),
        preferredTime: v.string(),
        instructions: v.string(),
      }),
    ),
    /** Resolved server-side from the delivery zone. null = confirmed on WhatsApp. */
    deliveryFee: v.union(v.number(), v.null()),
    lines: v.array(
      v.object({
        productId: v.string(),
        quantity: v.number(),
        color: v.optional(v.string()),
        size: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    if (args.lines.length === 0) {
      return { ok: false as const, error: "Your cart is empty." };
    }

    const items = [];
    for (const line of args.lines) {
      const doc = await ctx.db
        .query("products")
        .withIndex("by_product_id", (q) => q.eq("productId", line.productId))
        .unique();

      if (!doc || !isLive(doc)) {
        return {
          ok: false as const,
          error: "One of the pieces in your cart is no longer in the catalogue. Open your cart and try again.",
        };
      }

      const quantity = Math.max(1, Math.floor(line.quantity));
      const priced = unitPriceFor(doc, quantity);

      items.push({
        productId: doc.productId,
        productName: doc.name,
        slug: doc.slug,
        image: doc.imageSrc,
        // The lists are stated from the catalogue, never from the client. The
        // customer's choice is accepted only if the catalogue still lists it.
        colors: doc.colors,
        sizes: doc.sizes,
        ...(line.color && doc.colors.includes(line.color)
          ? { color: line.color }
          : {}),
        ...(line.size && doc.sizes.includes(line.size) ? { size: line.size } : {}),
        quantity,
        unitPrice: priced.unitPrice,
        appliedTier: priced.tier,
        lineTotal: priced.lineTotal,
      });
    }

    const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
    const deliveryFee = args.fulfilment === "pickup" ? 0 : args.deliveryFee;

    // Atomic daily counter: UDK-YYYYMMDD-NNN.
    const key = dateKey(new Date());
    const counter = await ctx.db
      .query("counters")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    const value = (counter?.value ?? 0) + 1;
    if (counter) {
      await ctx.db.patch(counter._id, { value });
    } else {
      await ctx.db.insert("counters", { key, value });
    }

    const orderNumber = `UDK-${key}-${String(value).padStart(3, "0")}`;

    const order = {
      orderNumber,
      status: "received" as const,
      fulfilment: args.fulfilment,
      customer: args.customer,
      ...(args.fulfilment === "pickup" && args.pickup
        ? { pickup: args.pickup }
        : {}),
      ...(args.fulfilment === "delivery" && args.delivery
        ? { delivery: args.delivery }
        : {}),
      items,
      subtotal,
      deliveryFee,
      total: subtotal + (deliveryFee ?? 0),
      whatsappOpened: false,
      createdAt: Date.now(),
    };

    await ctx.db.insert("orders", order);
    return { ok: true as const, order };
  },
});

export const byNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    const doc = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) =>
        q.eq("orderNumber", orderNumber.trim().toUpperCase()),
      )
      .unique();
    return doc ? toOrder(doc) : null;
  },
});

export const markWhatsappOpened = mutation({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    const doc = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
      .unique();
    if (doc) await ctx.db.patch(doc._id, { whatsappOpened: true });
  },
});
