import { unstable_cache } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Category, Product } from "./types";

/**
 * The catalogue, read from Convex on the server only.
 *
 *                      ┌── Admin → Convex (live, per request)
 *   Convex ── cache ───┤
 *                      └── Public catalogue (static HTML on the CDN)
 *
 * Public pages are prerendered at build and served as static files. Convex is
 * read when a page is (re)generated, never per visitor. Two things regenerate:
 *
 * 1. **An admin edit.** Every write in `app/(admin)/actions.ts` calls
 *    `refreshStorefront()`, which expires `CATALOG_TAG` and the page cache, so
 *    the next visitor to each page triggers one regeneration and everyone after
 *    them gets static HTML again.
 * 2. **A daily safety net** (`CATALOG_REVALIDATE`), in case a change ever
 *    reaches Convex without going through the admin (a seed, a migration, the
 *    Convex dashboard). Pages export the same number as `revalidate`.
 */

export const CATALOG_TAG = "catalog";

/** One day. Keep in step with the `revalidate` literal on catalogue pages. */
export const CATALOG_REVALIDATE = 86400;

const cached = <T>(key: string, fn: () => Promise<T>) =>
  unstable_cache(fn, [key], { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE });

/**
 * `fetchQuery` reads `NEXT_PUBLIC_CONVEX_URL` itself, and when it is missing the
 * failure surfaces during `next build` as "Failed to collect page data", with the
 * cause several frames down. Checking here turns it into one line that names it.
 */
function requireConvexUrl(): void {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set, so the catalogue cannot be read from " +
        "Convex. Locally it comes from .env.local; in CI and on the host it has " +
        "to be set in the build environment.",
    );
  }
  // `.convex.site` serves HTTP actions and cannot answer queries.
  if (new URL(process.env.NEXT_PUBLIC_CONVEX_URL).hostname.endsWith(".convex.site")) {
    throw new Error(
      `NEXT_PUBLIC_CONVEX_URL is set to ${process.env.NEXT_PUBLIC_CONVEX_URL}, which ` +
        "is the HTTP actions origin. Queries need the .convex.cloud deployment URL.",
    );
  }
}

/** Puts the deployment URL and the function name on the same line as the failure. */
async function read<T>(name: string, run: () => Promise<T>): Promise<T> {
  requireConvexUrl();
  try {
    return await run();
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new Error(
      `Convex query \`${name}\` failed against ${process.env.NEXT_PUBLIC_CONVEX_URL}: ` +
        `${detail}. Check that this is the deployment the current code was pushed to ` +
        "(`npx convex deploy`) and that it holds the catalogue.",
      { cause },
    );
  }
}

export const getCategories = cached("categories", async (): Promise<Category[]> =>
  read("catalog:listCategories", () => fetchQuery(api.catalog.listCategories, {})),
);

export const getProducts = cached("products", async (): Promise<Product[]> =>
  read("catalog:listProducts", () => fetchQuery(api.catalog.listProducts, {})),
);

export async function categoryBySlug(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function productBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function productsInCategory(slug: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.categorySlug === slug);
}

/** Same category first, then the best sellers from everywhere else. */
export async function relatedTo(product: Product, limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .concat(
      all
        .filter((p) => p.categorySlug !== product.categorySlug)
        .sort((a, b) => b.orderCount - a.orderCount),
    )
    .slice(0, limit);
}
