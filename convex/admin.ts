import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server.js";
import type { Id } from "./_generated/dataModel.js";
import { requireAdmin } from "./auth.js";
import { toCategory, toProduct } from "./model.js";

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
  categorySlug: v.string(),
  imageAlt: v.string(),
  retailPrice: v.number(),
  priceTiers: v.array(v.object({ minQty: v.number(), unitPrice: v.number() })),
  wholesaleMinQty: v.union(v.number(), v.null()),
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
export const MAX_IMAGE_BYTES = 500 * 1024;

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
  // Every message here ends with the same instruction. These three rejections
  // all delete the blob on the way out, so the photograph in the form is gone
  // even though it is still on screen — and "choose the photograph again" is
  // the only thing that gets the admin out of it.
  const meta = await ctx.db.system.get(storageId);
  if (!meta) {
    throw new Error("That photograph is no longer available. Choose it again.");
  }

  if (meta.size > MAX_IMAGE_BYTES) {
    await ctx.storage.delete(storageId);
    throw new Error(
      `That photograph is ${Math.round(meta.size / 1024)} KB and the limit is ${MAX_IMAGE_BYTES / 1024} KB. Choose a different photograph.`,
    );
  }
  // Absent counts as invalid. The browser sets `Content-Type` from `blob.type`
  // and `toBlob` always fills that in, so nothing this shop uploads arrives
  // without one — but the upload URL takes whatever is POSTed to it, and a
  // permissive branch here would be the way past the only type check there is.
  if (!meta.contentType || !ALLOWED_IMAGE_TYPES.includes(meta.contentType)) {
    await ctx.storage.delete(storageId);
    throw new Error(
      `${meta.contentType ?? "That file"} is not an image this shop accepts. Choose a photograph instead.`,
    );
  }

  const url = await ctx.storage.getUrl(storageId);
  if (!url) {
    throw new Error("That photograph is no longer available. Choose it again.");
  }
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
 * Cleanup for an upload the browser knows has become unreachable: the admin
 * chose a second photograph before saving, so the first one can go.
 *
 * Deliberately *not* called when a save fails — the form is still on screen and
 * the admin is about to press Save again; see `saveProduct`. Those blobs, and
 * the ones left by an abandoned form, are collected by
 * `sweepOrphanedUploads` instead.
 */
export const deleteUpload = mutation({
  args: { ...secretArg, storageId: v.id("_storage") },
  handler: async (ctx, { secret, storageId }) => {
    requireAdmin(secret);
    const onProduct = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("imageStorageId"), storageId))
      .first();
    const onCategory = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("heroImageStorageId"), storageId))
      .first();
    // Never delete a blob a product or a rail is actually using.
    if (onProduct || onCategory) return;
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

/* ------------------------------------------------------------------ *
 * Categories
 * ------------------------------------------------------------------ */

/**
 * A rail is a photograph and a name. That is the whole editable surface.
 *
 * There is deliberately no description: the shopkeeper adding "Jackets" to the
 * shop should type the word "Jackets" and choose a photo, and the card works
 * out the rest — the piece count is counted, the SEO listing is derived, the
 * web address is derived. Every field that was a paragraph to write was a
 * field that stayed empty or stayed wrong.
 */
const categoryFields = {
  name: v.string(),
  slug: v.string(),
  seoTitle: v.string(),
  seoDescription: v.string(),
};

export const listAllCategories = query({
  args: secretArg,
  handler: async (ctx, { secret }) => {
    requireAdmin(secret);
    const docs = await ctx.db.query("categories").collect();
    return docs.map(toCategory).sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

export const createCategory = mutation({
  args: { ...secretArg, ...categoryFields, imageStorageId: v.id("_storage") },
  handler: async (ctx, { secret, imageStorageId, ...fields }) => {
    requireAdmin(secret);

    const clash = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", fields.slug))
      .unique();
    if (clash) throw new Error(`There is already a section called "${clash.name}".`);

    // New rails go on the end. Reordering is not something the shop has asked
    // for, and an admin who wants a different order can be given one later
    // without any of this changing.
    const all = await ctx.db.query("categories").collect();
    const last = all.reduce((n, doc) => Math.max(n, doc.orderIndex), 0);

    return ctx.db.insert("categories", {
      ...fields,
      heroImage: await resolveImage(ctx, imageStorageId),
      heroImageStorageId: imageStorageId,
      orderIndex: last + 1,
    });
  },
});

/**
 * Renames and re-photographs a rail. The slug is not among the arguments on
 * purpose: shoppers, Google and every printed WhatsApp link hold
 * `/category/<slug>`, and a rename is not a reason to break them.
 */
export const updateCategory = mutation({
  args: {
    ...secretArg,
    slug: v.string(),
    name: v.string(),
    seoTitle: v.string(),
    seoDescription: v.string(),
    /** Absent means "keep the photograph that is already there". */
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { secret, slug, imageStorageId, ...fields }) => {
    requireAdmin(secret);
    const doc = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!doc) throw new Error(`No section "${slug}".`);

    if (!imageStorageId || imageStorageId === doc.heroImageStorageId) {
      await ctx.db.patch(doc._id, fields);
      return;
    }

    await ctx.db.patch(doc._id, {
      ...fields,
      heroImage: await resolveImage(ctx, imageStorageId),
      heroImageStorageId: imageStorageId,
    });
    // The row now points at the new blob, so the old one is unreachable.
    // Seeded rails have no storage id — their file under `public/catalogue/`
    // is part of the repository and is not ours to delete.
    if (doc.heroImageStorageId) await ctx.storage.delete(doc.heroImageStorageId);
  },
});

/**
 * Removes a rail, photograph included.
 *
 * Refused while any piece still sits in it. A product carries a
 * `categorySlug`, not a reference, so deleting the rail underneath one would
 * not fail anywhere — it would quietly strand the piece: absent from
 * `/categories`, absent from every rail, reachable only by its own address.
 * Better to say so and let the admin move them.
 */
export const deleteCategory = mutation({
  args: { ...secretArg, slug: v.string() },
  handler: async (ctx, { secret, slug }) => {
    requireAdmin(secret);
    const doc = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!doc) throw new Error(`No section "${slug}".`);

    // Archived pieces count too: an archive is restorable, and it would come
    // back into a section that no longer exists.
    const held = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categorySlug", slug))
      .collect();
    if (held.length > 0) {
      throw new Error(
        `${doc.name} still has ${held.length} ${held.length === 1 ? "piece" : "pieces"} in it. Move them to another section first, then remove it.`,
      );
    }

    await ctx.db.delete(doc._id);
    if (doc.heroImageStorageId) await ctx.storage.delete(doc.heroImageStorageId);
  },
});

/* ------------------------------------------------------------------ *
 * Storage housekeeping
 * ------------------------------------------------------------------ */

/**
 * How long an unreferenced blob is left alone before the sweeper takes it.
 *
 * This is the whole safety of the thing. An admin who has uploaded a
 * photograph and not yet pressed Save owns a blob that nothing points at, and
 * it must not be collected out from under them mid-form. A day is far longer
 * than anyone spends filling in one product, and short enough that abandoned
 * uploads do not accumulate.
 */
const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * Deletes uploaded photographs that no product and no rail points at.
 *
 * `deleteUpload` covers the paths the browser knows about — a replaced
 * photograph, a save that failed validation. It cannot cover the one that
 * happens most: the admin uploads, then closes the tab. No client-side hook
 * fixes that reliably (a phone browser killed in the background fires nothing
 * at all), so the collection has to happen server-side, on a schedule.
 *
 * Only blobs older than `ORPHAN_GRACE_MS` are considered, and each is checked
 * against both tables immediately before it goes. Seeded photographs under
 * `public/catalogue/` are files on disk, not storage entries, so they are not
 * in scope here at all.
 *
 * `internalMutation`: reachable from the cron and the CLI, never from a
 * browser, which is why it takes no secret.
 */
export const sweepOrphanedUploads = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - ORPHAN_GRACE_MS;

    // The referenced ids, gathered once. A shop of this size has hundreds of
    // rows, not millions, so this is cheaper than a filtered scan per blob.
    const inUse = new Set<string>();
    for (const product of await ctx.db.query("products").collect()) {
      if (product.imageStorageId) inUse.add(product.imageStorageId);
    }
    for (const category of await ctx.db.query("categories").collect()) {
      if (category.heroImageStorageId) inUse.add(category.heroImageStorageId);
    }

    let deleted = 0;
    for (const blob of await ctx.db.system.query("_storage").collect()) {
      if (blob._creationTime > cutoff) continue;
      if (inUse.has(blob._id)) continue;
      await ctx.storage.delete(blob._id);
      deleted += 1;
    }

    return { deleted };
  },
});
