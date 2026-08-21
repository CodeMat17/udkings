import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * §5 of the build spec, as Convex tables.
 *
 * Two things are deliberate here:
 *
 * - `productId` is a stable string (`prd_001`) alongside Convex's own `_id`.
 *   Carts live in the customer's browser and orders are a permanent record;
 *   both reference products by this id, so it must survive a re-seed.
 * - There is no variant or stock table. Per DECISIONS.md, the colour and size
 *   lists *are* the availability — the admin types in what is in the shop.
 */

const priceTier = v.object({
  minQty: v.number(),
  unitPrice: v.number(),
});

const orderItem = v.object({
  productId: v.string(),
  productName: v.string(),
  slug: v.string(),
  image: v.string(),
  colors: v.array(v.string()),
  sizes: v.array(v.string()),
  /** What the customer chose on the product page, when they chose. */
  color: v.optional(v.string()),
  size: v.optional(v.string()),
  quantity: v.number(),
  unitPrice: v.number(),
  appliedTier: v.union(v.literal("retail"), v.literal("wholesale")),
  lineTotal: v.number(),
});

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    heroImage: v.string(),
    orderIndex: v.number(),
    seoTitle: v.string(),
    seoDescription: v.string(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    productId: v.string(),
    name: v.string(),
    slug: v.string(),
    sku: v.string(),
    description: v.string(),
    material: v.string(),
    careInstructions: v.string(),
    categorySlug: v.string(),
    imageSrc: v.string(),
    imageAlt: v.string(),
    /**
     * Present when the photograph was uploaded through the admin, absent when
     * it is a seeded file under `public/catalogue/`. `imageSrc` is the URL
     * either way; this is what lets a replaced or deleted product take its
     * blob with it instead of leaving an orphan in storage.
     */
    imageStorageId: v.optional(v.id("_storage")),
    retailPrice: v.number(),
    priceTiers: v.array(priceTier),
    wholesaleMinQty: v.union(v.number(), v.null()),
    colors: v.array(v.string()),
    sizes: v.array(v.string()),
    isFeatured: v.boolean(),
    isNewArrival: v.boolean(),
    isBestSeller: v.boolean(),
    orderCount: v.number(),
    seoTitle: v.string(),
    seoDescription: v.string(),
    /** Soft delete. Absent or false means live; the storefront never sees true. */
    isArchived: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_product_id", ["productId"])
    .index("by_slug", ["slug"])
    .index("by_category", ["categorySlug"]),

  orders: defineTable({
    orderNumber: v.string(),
    status: v.union(
      v.literal("received"),
      v.literal("awaiting_confirmation"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready_for_pickup"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
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
    items: v.array(orderItem),
    subtotal: v.number(),
    /** null means "confirmed on WhatsApp". Never invent a number. */
    deliveryFee: v.union(v.number(), v.null()),
    total: v.number(),
    whatsappOpened: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_order_number", ["orderNumber"])
    .index("by_created", ["createdAt"]),

  /**
   * One row per UTC date, holding the last order number issued that day.
   * Convex mutations are serializable transactions, so the read-modify-write
   * below is atomic without a lock — which is the whole reason the file-backed
   * stand-in needed one.
   */
  counters: defineTable({
    key: v.string(),
    value: v.number(),
  }).index("by_key", ["key"]),
});
