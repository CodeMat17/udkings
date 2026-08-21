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
  // The two Convex origins differ by one word and sit next to each other in
  // .env.local, so the wrong one gets pasted into a host's dashboard easily.
  // `.convex.site` serves HTTP actions and cannot answer queries.
  if (new URL(process.env.NEXT_PUBLIC_CONVEX_URL).hostname.endsWith(".convex.site")) {
    throw new Error(
      `NEXT_PUBLIC_CONVEX_URL is set to ${process.env.NEXT_PUBLIC_CONVEX_URL}, which ` +
        "is the HTTP actions origin. Queries need the deployment URL, which is the " +
        "same subdomain on .convex.cloud — that is NEXT_PUBLIC_CONVEX_SITE_URL's " +
        "counterpart, not its value.",
    );
  }
}

/**
 * Convex reports a function that threw as `[Request ID: ...] Server Error`, with
 * no mention of which deployment answered or which query was asked. During
 * `next build` that lands as a bare "Server Error" under `generateStaticParams`
 * and says nothing actionable. Wrapping the call puts the deployment URL and the
 * function name on the same line, which is the pair that is almost always wrong
 * on a host: a build pointed at a Convex deployment the current code was never
 * pushed to.
 */
async function read<T>(name: string, run: () => Promise<T>): Promise<T> {
  requireConvexUrl();
  try {
    return await run();
  } catch (cause) {
    // The `cause` chain holds the failure that actually happened, but an Error is
    // reported by its own message and its own stack: the dev overlay and the build
    // log both point at the `throw` below and show nothing of the cause. So the
    // cause's message is folded into the message here as well as attached.
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new Error(
      `Convex query \`${name}\` failed against ${process.env.NEXT_PUBLIC_CONVEX_URL}: ` +
        `${detail}. ` +
        "Check that this is the deployment the current code was pushed to " +
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
