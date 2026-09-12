"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CATALOG_TAG } from "@/lib/catalog";
import {
  ADMIN_COOKIE,
  SESSION_COOKIE_OPTIONS,
  adminSecret,
  checkPasscode,
  clearRateLimit,
  createSessionToken,
  rateLimit,
  verifySessionToken,
} from "@/lib/admin-auth";

/**
 * Expires the static storefront after a catalogue write.
 *
 * `updateTag` expires the cached Convex reads immediately (not
 * stale-while-revalidate), so the admin sees their own edit on the next load.
 * `revalidatePath("/", "layout")` expires every prerendered page beneath the
 * root layout: a product edit touches its own page, its category, the home
 * rails, "related" rails on other products and the header menu, so the whole
 * catalogue is the relevant cache. Nothing regenerates eagerly — each page
 * rebuilds once, on its next visit, then is static again.
 */
function refreshStorefront(): void {
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

/**
 * The admin's server-side entry points.
 *
 * Every function that touches Convex calls `requireSession()` first and then
 * passes `adminSecret()` — held only here, on the server — into a mutation that
 * checks it again in `convex/auth.ts`. Two independent checks, and the browser
 * holds neither secret: it has a signed cookie that proves a passcode was
 * entered, and nothing more.
 */

async function clientKey(): Promise<string> {
  const list = await headers();
  // Behind a proxy the first forwarded address is the client. Falls back to a
  // single shared bucket, which fails safe: it rate-limits harder, not less.
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Convex wraps a thrown error as "[Request ID …] Server Error … Uncaught
 * Error: <message>". The admin should read the sentence, not the wrapper.
 */
function message(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const match = raw.match(/Uncaught Error:\s*([^\n]+)/);
  return (match?.[1] ?? raw).trim() || "That could not be saved.";
}

/**
 * A validation error that knows which control the admin has to go and fix.
 *
 * The sentence on its own leaves them hunting: a long form, a red line at the
 * bottom, and nothing saying which of fifteen boxes it is about. `field` is the
 * id of the control on the form, so the browser can put the cursor in it.
 */
class FieldError extends Error {
  constructor(
    readonly field: string,
    text: string,
  ) {
    super(text);
  }
}

/** The failure shape both save actions return, carrying the field when known. */
function failure(error: unknown): { ok: false; error: string; field?: string } {
  return {
    ok: false,
    error: message(error),
    ...(error instanceof FieldError ? { field: error.field } : {}),
  };
}

/** "Stone Wash Straight Jean" → "stone-wash-straight-jean". */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * "UDK-JNS-4F2A". The middle is the category, the tail a stable digest of the
 * name. Derived here rather than typed: it is exactly the kind of field an
 * admin gets subtly wrong, and nothing about the shop needs a human to choose
 * it. The same name in the same category always yields the same SKU.
 */
function makeSku(name: string, categorySlug: string): string {
  const clean = slugify(name);
  const category = (categorySlug.replace(/[^a-z]/g, "").slice(0, 3) || "gen").toUpperCase();

  let hash = 0;
  for (const char of clean) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const tail = hash.toString(36).toUpperCase().slice(-4).padStart(4, "0");

  return `UDK-${category}-${tail}`;
}

async function requireSession(): Promise<void> {
  const store = await cookies();
  const ok = await verifySessionToken(store.get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

export type SignInResult = { ok: false; error: string };

export async function signIn(
  _previous: SignInResult | null,
  formData: FormData,
): Promise<SignInResult> {
  const key = await clientKey();
  const limit = rateLimit(key);

  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return {
      ok: false,
      error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const passcode = String(formData.get("passcode") ?? "");
  if (!(await checkPasscode(passcode))) {
    // One message for every failure. Never say whether it was close.
    return { ok: false, error: "That passcode is not right." };
  }

  clearRateLimit(key);
  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionToken(), SESSION_COOKIE_OPTIONS);
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function listProducts() {
  await requireSession();
  return fetchQuery(api.admin.listAllProducts, { secret: adminSecret() });
}

export async function setArchived(productId: string, isArchived: boolean) {
  await requireSession();
  await fetchMutation(api.admin.setArchived, {
    secret: adminSecret(),
    productId,
    isArchived,
  });
  // The storefront reads a cached catalogue; an edit is what invalidates it.
  // `updateTag` expires immediately rather than serving stale-while-revalidate,
  // so the admin sees their own edit on the shop the moment they make it.
  refreshStorefront();
}

/* ------------------------------------------------------------------ *
 * Products
 * ------------------------------------------------------------------ */

/**
 * Hands the browser a one-shot upload URL so the photograph goes straight to
 * Convex storage. Server actions have a body limit and would double the
 * transfer for no gain; the admin secret still never leaves this process.
 */
export type UploadUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function createUploadUrl(): Promise<UploadUrlResult> {
  // Deliberately not requireSession(): that redirects, and a redirect thrown
  // out of an action called from a click handler reaches the admin as an opaque
  // failure. A signed-out admin should be told they are signed out.
  const store = await cookies();
  if (!(await verifySessionToken(store.get(ADMIN_COOKIE)?.value))) {
    return { ok: false, error: "You have been signed out. Open the admin again and sign in, then choose the photograph." };
  }

  try {
    const url = await fetchMutation(api.admin.generateUploadUrl, { secret: adminSecret() });
    return { ok: true, url };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

/** Removes a blob whose product was never saved. Best-effort by design. */
export async function discardUpload(storageId: string): Promise<void> {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(ADMIN_COOKIE)?.value))) return;
  try {
    await fetchMutation(api.admin.deleteUpload, {
      secret: adminSecret(),
      storageId: storageId as Id<"_storage">,
    });
  } catch {
    // An orphaned blob is a few kilobytes; a thrown error here would replace
    // the real save error the admin needs to read. Swallow it.
  }
}

/**
 * The browser toasts the outcome, so a success has to come back as a value
 * rather than a redirect — a redirected action never returns to the form.
 * The client navigates once it has shown the toast.
 */
export type SaveProductResult =
  | { ok: false; error: string; field?: string }
  | { ok: true; name: string; created: boolean };

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

const list = (form: FormData, key: string) =>
  text(form, key)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

/** Naira integers, per the spec. A price with kobo in it is a typo. */
function naira(form: FormData, key: string, label: string): number {
  const value = Number(text(form, key));
  if (!Number.isInteger(value) || value <= 0) {
    throw new FieldError(key, `${label} must be a whole number of naira.`);
  }
  return value;
}

/**
 * Wholesale tiers come in as parallel `tierMinQty` / `tierUnitPrice` rows.
 * Blank rows are dropped so the admin can leave spare rows empty, and the
 * retail price is prepended as tier one — the shape `lib/pricing.ts` expects.
 */
function priceTiers(form: FormData, retailPrice: number) {
  const minQtys = form.getAll("tierMinQty").map((raw) => String(raw).trim());
  const unitPrices = form.getAll("tierUnitPrice").map((raw) => String(raw).trim());

  const tiers = minQtys
    .map((minQty, index) => ({ minQty, unitPrice: unitPrices[index] ?? "" }))
    .filter((row) => row.minQty !== "" || row.unitPrice !== "")
    .map((row, index) => {
      const minQty = Number(row.minQty);
      const unitPrice = Number(row.unitPrice);
      if (!Number.isInteger(minQty) || minQty < 2) {
        throw new FieldError(
          `tierMinQty-${index}`,
          `Bulk price ${index + 1}: the quantity must be a whole number, 2 or more.`,
        );
      }
      if (!Number.isInteger(unitPrice) || unitPrice <= 0) {
        throw new FieldError(
          `tierUnitPrice-${index}`,
          `Bulk price ${index + 1}: fill in the price each, in whole naira.`,
        );
      }
      if (unitPrice >= retailPrice) {
        throw new FieldError(
          `tierUnitPrice-${index}`,
          `Bulk price ${index + 1} is not cheaper than the normal price. A bulk price has to be a discount.`,
        );
      }
      return { minQty, unitPrice };
    })
    .sort((a, b) => a.minQty - b.minQty);

  return [{ minQty: 1, unitPrice: retailPrice }, ...tiers];
}

/**
 * Everything the shop needs, from the few things the admin actually typed.
 *
 * The web address, the SKU and the search listing are *derived*, never typed.
 * They are the fields an admin gets subtly wrong — a stray capital, a space, a
 * title that drifts from the name — and every one of them can be rebuilt from
 * the name, the category and the description. Asking for them was asking the
 * shopkeeper to do the computer's job.
 *
 * An existing piece keeps the web address it was published under: a live link
 * that starts 404-ing because a typo was fixed in the name is worse than a
 * slightly stale address.
 */
/**
 * Everything the shop needs, from the few things the admin actually typed.
 *
 * The web address, the SKU and the search listing are *derived*, never typed.
 * They are the fields an admin gets subtly wrong — a stray capital, a space, a
 * title that drifts from the name — and every one of them can be rebuilt from
 * the name, the category and the description. Asking for them was asking the
 * shopkeeper to do the computer's job.
 *
 * An existing piece keeps the web address it was published under: a live link
 * that starts 404-ing because a typo was fixed in the name is worse than a
 * slightly stale address.
 */
function productArgs(form: FormData) {
  const name = text(form, "name");
  if (!name) throw new FieldError("name", "A piece needs a name.");

  const slug = text(form, "currentSlug") || slugify(name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new FieldError("name", "A name needs at least one letter or number in it.");
  }

  const categorySlug = text(form, "categorySlug");
  if (!categorySlug) {
    throw new FieldError("categorySlug", "Choose which part of the shop this belongs in.");
  }

  const description = text(form, "description");

  const sizes = list(form, "sizes");
  if (sizes.length === 0) {
    throw new FieldError("sizes", "Choose at least one size you have in stock.");
  }

  const retailPrice = naira(form, "retailPrice", "The price");
  const tiers = priceTiers(form, retailPrice);

  // The wholesale minimum is the first bulk tier, not a separate number to keep
  // in step with it. Two fields that had to agree were two chances to disagree.
  const wholesaleMinQty = tiers[1]?.minQty ?? null;

  return {
    name,
    slug,
    sku: makeSku(name, categorySlug),
    description,
    categorySlug,
    // Screen readers read this aloud. The name of the piece is a truer
    // description than anything an admin would have typed into a field whose
    // purpose they had to have explained to them.
    imageAlt: name,
    retailPrice,
    priceTiers: tiers,
    wholesaleMinQty,
    sizes,
    isFeatured: form.get("isFeatured") === "on",
    isNewArrival: form.get("isNewArrival") === "on",
    isBestSeller: form.get("isBestSeller") === "on",
    seoTitle: name,
    seoDescription: description.slice(0, 155),
  };
}

/**
 * One action for both new and existing pieces: the presence of `productId`
 * decides. On a create the photograph is required; on an edit an unchanged one
 * is left alone.
 *
 * A failed save deliberately leaves the uploaded blob alone. It used to delete
 * it, which was tidy and wrong: the form is still on screen, still showing the
 * photograph, still holding its storage id — so the admin fixes the typo that
 * caused the failure, presses Save again, and is told "that upload is no longer
 * in storage" about a photograph they can see. There is no way out of that
 * except re-choosing the file, and nothing on screen says so. Now the second
 * Save simply works. `admin:sweepOrphanedUploads` collects the blob a day later
 * if the admin gives up instead.
 */
export async function saveProduct(
  _previous: SaveProductResult | null,
  form: FormData,
): Promise<SaveProductResult> {
  await requireSession();

  const productId = text(form, "productId");
  const uploaded = text(form, "imageStorageId");

  let args: ReturnType<typeof productArgs>;
  try {
    args = productArgs(form);
  } catch (error) {
    return failure(error);
  }

  try {
    if (productId) {
      await fetchMutation(api.admin.updateProduct, {
        secret: adminSecret(),
        productId,
        ...args,
        ...(uploaded ? { imageStorageId: uploaded as Id<"_storage"> } : {}),
      });
    } else {
      if (!uploaded) {
        return { ok: false, error: "Choose a photograph for this piece.", field: "photograph" };
      }
      await fetchMutation(api.admin.createProduct, {
        secret: adminSecret(),
        ...args,
        imageStorageId: uploaded as Id<"_storage">,
      });
    }
  } catch (error) {
    return { ok: false, error: message(error) };
  }

  refreshStorefront();
  return { ok: true, name: args.name, created: !productId };
}

/**
 * Deletes the piece and its photograph together.
 *
 * Convex refuses once the piece appears in an order — that message is worth
 * showing, so it comes back as a value rather than blowing up the page.
 */
export async function deleteProduct(
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  try {
    await fetchMutation(api.admin.deleteProduct, {
      secret: adminSecret(),
      productId,
    });
  } catch (error) {
    return { ok: false, error: message(error) };
  }
  refreshStorefront();
  return { ok: true };
}

/* ------------------------------------------------------------------ *
 * Categories
 * ------------------------------------------------------------------ */

/**
 * The shop's rails, as the admin sees them.
 *
 * Read through the secret-guarded query rather than the cached storefront
 * catalogue so a rail added a second ago is on the page, not on the next
 * revalidation.
 */
export async function listCategories() {
  await requireSession();
  return fetchQuery(api.admin.listAllCategories, { secret: adminSecret() });
}

export type SaveCategoryResult =
  | { ok: false; error: string; field?: string }
  | { ok: true; name: string; created: boolean };

/**
 * The search listing for a rail, written from its name.
 *
 * The seeded eight carry hand-written copy that is better than anything
 * generated, so an edit that leaves the name alone leaves that copy alone. A
 * rename regenerates it: a section renamed from "Gowns" to "Dresses" whose
 * Google listing still says "Gowns" is worse than a plain sentence.
 */
function categorySeo(name: string) {
  return {
    seoTitle: `${name} in Lagos — Retail & Wholesale | UDKING'S Collections`,
    seoDescription: `${name} at UDKING'S Collections, Lagos Island. Retail and wholesale prices, pickup at the shop or delivery nationwide. Order on WhatsApp.`,
  };
}

/**
 * One action for adding a rail and for editing one, the way `saveProduct` is
 * one action for both. A new rail needs a photograph; an existing one keeps
 * the photograph and the web address it already has.
 */
export async function saveCategory(
  _previous: SaveCategoryResult | null,
  form: FormData,
): Promise<SaveCategoryResult> {
  await requireSession();

  const currentSlug = text(form, "currentSlug");
  const uploaded = text(form, "imageStorageId");

  const name = text(form, "name");
  if (!name) {
    return { ok: false, error: "A section needs a name.", field: "name" };
  }

  const slug = currentSlug || slugify(name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, error: "A name needs at least one letter or number in it.", field: "name" };
  }

  const previousName = text(form, "currentName");
  const seo =
    currentSlug && previousName === name
      ? { seoTitle: text(form, "currentSeoTitle"), seoDescription: text(form, "currentSeoDescription") }
      : categorySeo(name);

  try {
    if (currentSlug) {
      await fetchMutation(api.admin.updateCategory, {
        secret: adminSecret(),
        slug,
        name,
        ...seo,
        ...(uploaded ? { imageStorageId: uploaded as Id<"_storage"> } : {}),
      });
    } else {
      if (!uploaded) {
        return { ok: false, error: "Choose a photograph for this section.", field: "photograph" };
      }
      await fetchMutation(api.admin.createCategory, {
        secret: adminSecret(),
        name,
        slug,
        ...seo,
        imageStorageId: uploaded as Id<"_storage">,
      });
    }
  } catch (error) {
    return { ok: false, error: message(error) };
  }

  refreshStorefront();
  return { ok: true, name, created: !currentSlug };
}

/**
 * Removes a rail and its photograph.
 *
 * Convex refuses while pieces are still in it, and that sentence is the whole
 * point of the refusal, so it comes back as a value to be toasted rather than
 * thrown at the page.
 */
export async function deleteCategory(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  try {
    await fetchMutation(api.admin.deleteCategory, { secret: adminSecret(), slug });
  } catch (error) {
    return { ok: false, error: message(error) };
  }
  refreshStorefront();
  return { ok: true };
}
