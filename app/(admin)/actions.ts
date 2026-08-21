"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
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

/** "Stone Wash Straight Jean" → "stone-wash-straight-jean". */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export async function listOrders() {
  await requireSession();
  return fetchQuery(api.admin.listOrders, { secret: adminSecret() });
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
  updateTag(CATALOG_TAG);
}

/* ------------------------------------------------------------------ *
 * Products
 * ------------------------------------------------------------------ */

/**
 * Hands the browser a one-shot upload URL so the photograph goes straight to
 * Convex storage. Server actions have a body limit and would double the
 * transfer for no gain; the admin secret still never leaves this process.
 */
export async function createUploadUrl(): Promise<string> {
  await requireSession();
  return fetchMutation(api.admin.generateUploadUrl, { secret: adminSecret() });
}

/** Removes a blob whose product was never saved. Best-effort by design. */
export async function discardUpload(storageId: string): Promise<void> {
  await requireSession();
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
  | { ok: false; error: string }
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
    throw new Error(`${label} must be a whole number of naira.`);
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
        throw new Error(`Wholesale tier ${index + 1} needs a quantity of 2 or more.`);
      }
      if (!Number.isInteger(unitPrice) || unitPrice <= 0) {
        throw new Error(`Wholesale tier ${index + 1} needs a whole naira price.`);
      }
      if (unitPrice >= retailPrice) {
        throw new Error(
          `Wholesale tier ${index + 1} is not cheaper than the retail price.`,
        );
      }
      return { minQty, unitPrice };
    })
    .sort((a, b) => a.minQty - b.minQty);

  return [{ minQty: 1, unitPrice: retailPrice }, ...tiers];
}

function productArgs(form: FormData) {
  const name = text(form, "name");
  if (!name) throw new Error("A piece needs a name.");

  const slug = text(form, "slug") || slugify(name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("The web address may only use lowercase letters, numbers and dashes.");
  }

  const imageAlt = text(form, "imageAlt");
  if (!imageAlt) {
    throw new Error("Describe the photograph — a screen reader reads this aloud.");
  }

  const colors = list(form, "colors");
  const sizes = list(form, "sizes");
  if (colors.length === 0) throw new Error("List at least one colour you have.");
  if (sizes.length === 0) throw new Error("List at least one size you have.");

  const retailPrice = naira(form, "retailPrice", "The retail price");
  const tiers = priceTiers(form, retailPrice);
  const wholesale = text(form, "wholesaleMinQty");
  const wholesaleMinQty = wholesale === "" ? null : Number(wholesale);
  if (wholesaleMinQty !== null && (!Number.isInteger(wholesaleMinQty) || wholesaleMinQty < 2)) {
    throw new Error("The wholesale minimum must be a whole number of 2 or more.");
  }

  return {
    name,
    slug,
    sku: text(form, "sku") || slug.toUpperCase(),
    description: text(form, "description"),
    material: text(form, "material"),
    careInstructions: text(form, "careInstructions"),
    categorySlug: text(form, "categorySlug"),
    imageAlt,
    retailPrice,
    priceTiers: tiers,
    wholesaleMinQty,
    colors,
    sizes,
    isFeatured: form.get("isFeatured") === "on",
    isNewArrival: form.get("isNewArrival") === "on",
    isBestSeller: form.get("isBestSeller") === "on",
    seoTitle: text(form, "seoTitle") || name,
    seoDescription: text(form, "seoDescription") || text(form, "description").slice(0, 155),
  };
}

/**
 * One action for both new and existing pieces: the presence of `productId`
 * decides. On a create the photograph is required; on an edit an unchanged one
 * is left alone. Either way, a failed save takes the just-uploaded blob with
 * it rather than leaving it stranded in storage.
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
    if (uploaded) await discardUpload(uploaded);
    return { ok: false, error: message(error) };
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
      if (!uploaded) return { ok: false, error: "Choose a photograph for this piece." };
      await fetchMutation(api.admin.createProduct, {
        secret: adminSecret(),
        ...args,
        imageStorageId: uploaded as Id<"_storage">,
      });
    }
  } catch (error) {
    if (uploaded) await discardUpload(uploaded);
    return { ok: false, error: message(error) };
  }

  updateTag(CATALOG_TAG);
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
  updateTag(CATALOG_TAG);
  return { ok: true };
}
