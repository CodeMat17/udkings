import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server.js";
import type { Id } from "./_generated/dataModel.js";
import { requireAdmin } from "./auth.js";
import { toProduct } from "./model.js";

/**
 * Every write to the catalogue. All of them call `requireAdmin` as their first
 * statement — that check is the wall, not the route gate in `proxy.ts`.
 *
 * The `secret` argument is supplied by a Next.js server action from its own
 * environment. It is never sent from a browser; see `lib/admin-auth.ts`.
 */

const secretArg = { secret: v.string() };

const productFields = {
  name: v.string(),
  slug: v.string(),
  sku: v.string(),
  description: v.string(),
  material: v.string(),
  careInstructions: v.string(),
  categorySlug: v.string(),
  imageAlt: v.string(),
  retailPrice: v.number(),
  priceTiers: v.array(v.object({ minQty: v.number(), unitPrice: v.number() })),
  wholesaleMinQty: v.union(v.number(), v.null()),
  colors: v.array(v.string()),
  sizes: v.array(v.string()),
  isFeatured: v.boolean(),
  isNewArrival: v.boolean(),
  isBestSeller: v.boolean(),
  seoTitle: v.string(),
  seoDescription: v.string(),
};

/**
 * Admin listing: includes archived pieces, which the storefront never sees.
 *
 * Sorted by `_creationTime` — when the row actually reached the database —
 * rather than by `createdAt`. `createdAt` is editorial: it is what the
 * storefront calls a new arrival, and a seeded piece carries a hand-written
 * date that can sit ahead of today. The admin needs the other question
 * answered — what did I just add? — so the piece added last is always the
 * piece at the top.
 */
export const listAllProducts = query({
  args: secretArg,
  handler: async (ctx, { secret }) => {
    requireAdmin(secret);
    const docs = await ctx.db.query("products").order("desc").collect();
    return docs.map((doc) => ({ ...toProduct(doc), isArchived: doc.isArchived === true }));
  },
});

export const listOrders = query({
  args: { ...secretArg, limit: v.optional(v.number()) },
  handler: async (ctx, { secret, limit }) => {
    requireAdmin(secret);
    return ctx.db
      .query("orders")
      .withIndex("by_created")
      .order("desc")
      .take(limit ?? 100);
  },
});

export const setOrderStatus = mutation({
  args: {
    ...secretArg,
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
  },
  handler: async (ctx, { secret, orderNumber, status }) => {
    requireAdmin(secret);
    const doc = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
      .unique();
    if (!doc) throw new Error(`No order ${orderNumber}.`);
    await ctx.db.patch(doc._id, { status });
  },
});

/**
 * A short-lived, single-use URL the browser POSTs the photograph to directly.
 * The bytes never pass through a Next.js server action — only the resulting
 * storage id does. The URL is unguessable and expires on its own, so handing
 * it to a signed-in admin's browser is not the same as handing out the secret.
 */
export const generateUploadUrl = mutation({
  args: secretArg,
  handler: async (ctx, { secret }) => {
    requireAdmin(secret);
    return ctx.storage.generateUploadUrl();
  },
});

/** Hard ceiling on a stored photograph. Mirrored in `lib/image.ts`. */
export const MAX_IMAGE_BYTES = 200 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/webp", "image/jpeg", "image/png"];

/**
 * Validates the uploaded blob and returns the URL to store.
 *
 * The browser compresses before uploading, but the upload URL accepts whatever
 * is POSTed to it — so the cap is enforced here, where it cannot be skipped, as
 * well as there, where it spares the admin a pointless upload.
 *
 * Convex hands out a stable URL per storage id, so writing it into `imageSrc`
 * keeps every read path — `toProduct`, the cart lines, the order snapshots —
 * working on a plain string, exactly as it did when photographs were files
 * under `public/catalogue/`.
 */
async function resolveImage(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
): Promise<string> {
  const meta = await ctx.db.system.get(storageId);
  if (!meta) throw new Error("That upload is no longer in storage.");

  if (meta.size > MAX_IMAGE_BYTES) {
    await ctx.storage.delete(storageId);
    throw new Error(
      `That photograph is ${Math.round(meta.size / 1024)} KB. The limit is ${MAX_IMAGE_BYTES / 1024} KB.`,
    );
  }
  if (meta.contentType && !ALLOWED_IMAGE_TYPES.includes(meta.contentType)) {
    await ctx.storage.delete(storageId);
    throw new Error(`${meta.contentType} is not an image this shop accepts.`);
  }

  const url = await ctx.storage.getUrl(storageId);
  if (!url) throw new Error("That upload is no longer in storage.");
  return url;
}

export const createProduct = mutation({
  args: { ...secretArg, ...productFields, imageStorageId: v.id("_storage") },
  handler: async (ctx, { secret, imageStorageId, ...fields }) => {
    requireAdmin(secret);

    const clash = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", fields.slug))
      .unique();
    if (clash) throw new Error(`A product already uses the slug "${fields.slug}".`);

    // Stable, human-readable id that survives edits and re-seeds. Carts and
    // orders reference this, never the Convex `_id`.
    const all = await ctx.db.query("products").collect();
    const highest = all.reduce((n, doc) => {
      const parsed = Number(doc.productId.replace(/^prd_/, ""));
      return Number.isFinite(parsed) && parsed > n ? parsed : n;
    }, 0);

    return ctx.db.insert("products", {
      ...fields,
      imageStorageId,
      imageSrc: await resolveImage(ctx, imageStorageId),
      productId: `prd_${String(highest + 1).padStart(3, "0")}`,
      orderCount: 0,
      isArchived: false,
      createdAt: Date.now(),
    });
  },
});

export const updateProduct = mutation({
  args: {
    ...secretArg,
    productId: v.string(),
    ...productFields,
    /** Absent means "keep the photograph that is already there". */
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { secret, productId, imageStorageId, ...fields }) => {
    requireAdmin(secret);
    const doc = await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("productId", productId))
      .unique();
    if (!doc) throw new Error(`No product ${productId}.`);

    if (!imageStorageId || imageStorageId === doc.imageStorageId) {
      await ctx.db.patch(doc._id, fields);
      return;
    }

    await ctx.db.patch(doc._id, {
      ...fields,
      imageStorageId,
      imageSrc: await resolveImage(ctx, imageStorageId),
    });
    // The row now points at the new blob, so the old one is unreachable.
    // Deleting it last means a failure above leaves the product intact.
    if (doc.imageStorageId) await ctx.storage.delete(doc.imageStorageId);
  },
});

/**
 * A hard delete, photograph included.
 *
 * Refused once the piece appears in an order: those records are permanent and
 * a removed row would leave a past order pointing at nothing. Archiving is the
 * answer there, which is what `setArchived` is for.
 */
export const deleteProduct = mutation({
  args: { ...secretArg, productId: v.string() },
  handler: async (ctx, { secret, productId }) => {
    requireAdmin(secret);
    const doc = await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("productId", productId))
      .unique();
    if (!doc) throw new Error(`No product ${productId}.`);

    const orders = await ctx.db.query("orders").collect();
    const ordered = orders.some((order) =>
      order.items.some((item) => item.productId === productId),
    );
    if (ordered) {
      throw new Error(
        `${doc.name} has been ordered before, so it cannot be deleted. Archive it instead — it disappears from the shop and the past orders stay readable.`,
      );
    }

    await ctx.db.delete(doc._id);
    if (doc.imageStorageId) await ctx.storage.delete(doc.imageStorageId);
  },
});

/**
 * Cleanup for an upload whose product never got saved — a slug clash, a
 * validation failure, an abandoned form. Without this every failed save would
 * strand a file in storage that nothing points at.
 */
export const deleteUpload = mutation({
  args: { ...secretArg, storageId: v.id("_storage") },
  handler: async (ctx, { secret, storageId }) => {
    requireAdmin(secret);
    const used = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("imageStorageId"), storageId))
      .first();
    // Never delete a blob a product is actually using.
    if (used) return;
    await ctx.storage.delete(storageId);
  },
});

/**
 * Archive, not delete. Orders carry a product id, and a deleted row would
 * leave a past order pointing at nothing.
 */
export const setArchived = mutation({
  args: { ...secretArg, productId: v.string(), isArchived: v.boolean() },
  handler: async (ctx, { secret, productId, isArchived }) => {
    requireAdmin(secret);
    const doc = await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("productId", productId))
      .unique();
    if (!doc) throw new Error(`No product ${productId}.`);
    await ctx.db.patch(doc._id, { isArchived });
  },
});
