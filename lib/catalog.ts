import { unstable_cache } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Category, Product } from "./types";

export { DELIVERY_ZONES, ZONE_LABELS, zoneFor, zoneLabel } from "./zones.ts";

/**
 * The catalogue, read from Convex on the server only.
 *
 * Two properties this module has to preserve, both of which predate Convex:
 *
 * 1. **It never enters a client bundle.** Every caller is a Server Component or
 *    a server action; client components go through `app/actions.ts`. That is
 *    what keeps the first-load JS where `docs/LIGHTHOUSE.md` records it.
 * 2. **Pages stay effectively static.** A database read per request would make
 *    every route dynamic and cost the LCP the design is built around. So reads
 *    are wrapped in `unstable_cache` with a shared tag, and the admin calls
 *    `revalidateTag(CATALOG_TAG)` after a write — the storefront is rebuilt on
 *    edit, not on every visit.
 *
 * `unstable_cache` is superseded by the `use cache` directive in Next 16, which
 * needs `cacheComponents: true` and a Suspense pass over all twenty routes.
 * That migration is worth doing and is noted in DECISIONS.md; this is the
 * behaviour-identical step that does not touch every page at once.
 */

export const CATALOG_TAG = "catalog";

const ONE_HOUR = 3600;

const cached = <T>(key: string, fn: () => Promise<T>) =>
  unstable_cache(fn, [key], { tags: [CATALOG_TAG], revalidate: ONE_HOUR });

/**
 * `fetchQuery` reads `NEXT_PUBLIC_CONVEX_URL` itself, and when it is missing the
 * failure surfaces during `next build` as "Failed to collect page data", with the
 * cause several frames down. Catalogue reads run at build time from
 * `generateStaticParams`, so that is the usual way to meet it: a build in a shell
 * or CI job that never loaded `.env.local`, which is not committed. Checking here
 * turns it into one line that names the variable.
 */
function requireConvexUrl(): void {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set, so the catalogue cannot be read from " +
        "Convex. Locally it comes from .env.local; in CI and on the host it has " +
        "to be set in the build environment.",
    );
  }
}

export const getCategories = cached("categories", async (): Promise<Category[]> => {
  requireConvexUrl();
  return fetchQuery(api.catalog.listCategories, {});
});

export const getProducts = cached("products", async (): Promise<Product[]> => {
  requireConvexUrl();
  return fetchQuery(api.catalog.listProducts, {});
});

export async function categoryBySlug(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function productBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function productById(id: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.id === id);
}

export async function productsInCategory(slug: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.categorySlug === slug);
}

/**
 * Same category first, then the best sellers from everywhere else. Reads the
 * one cached list rather than a second round trip.
 */
export async function relatedTo(product: Product, limit = 6): Promise<Product[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .concat(
      all
        .filter((p) => p.categorySlug !== product.categorySlug && p.id !== product.id)
        .sort((a, b) => b.orderCount - a.orderCount),
    )
    .slice(0, limit);
}
