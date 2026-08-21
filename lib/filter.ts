import { bestPriceFor } from "./pricing";
import type { Product } from "./types";

export const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
  { value: "popular", label: "Most popular" },
  { value: "best_selling", label: "Best selling" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

export type ShopQuery = {
  q?: string;
  category?: string;
  size?: string;
  color?: string;
  sort?: string;
  wholesale?: string;
};

function asString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function readQuery(
  params: Record<string, string | string[] | undefined>,
): ShopQuery {
  return {
    q: asString(params.q),
    category: asString(params.category),
    size: asString(params.size),
    color: asString(params.color),
    sort: asString(params.sort),
    wholesale: asString(params.wholesale),
  };
}

/**
 * Pure. The catalogue is now an async Convex read, so the caller fetches it and
 * passes it in — this file stays a function of its inputs and is testable
 * without a deployment.
 */
export function applyQuery(query: ShopQuery, source: Product[]): Product[] {
  let results = [...source];

  if (query.q) {
    const q = query.q.trim().toLowerCase();
    results = results.filter((p) =>
      [p.name, p.sku, p.categorySlug, p.material, ...p.colors, ...p.sizes]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  if (query.category) {
    results = results.filter((p) => p.categorySlug === query.category);
  }
  if (query.size) {
    results = results.filter((p) => p.sizes.includes(query.size!));
  }
  if (query.color) {
    results = results.filter((p) => p.colors.includes(query.color!));
  }
  if (query.wholesale === "1") {
    results = results.filter((p) => p.wholesaleMinQty !== null);
  }

  switch (query.sort) {
    case "price_asc":
      results.sort((a, b) => a.retailPrice - b.retailPrice);
      break;
    case "price_desc":
      results.sort((a, b) => b.retailPrice - a.retailPrice);
      break;
    case "popular":
    case "best_selling":
      results.sort((a, b) => b.orderCount - a.orderCount);
      break;
    default:
      results.sort((a, b) => b.createdAt - a.createdAt);
  }

  return results;
}

/** Every size present in a given set of products, in wearing order. */
export function sizesIn(products: Product[]): string[] {
  return Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => {
    const order = ["S", "M", "L", "XL", "XXL"];
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return Number(a) - Number(b);
  });
}

/** Every colour present in a given set of products. */
export function colorsIn(products: Product[]): string[] {
  return Array.from(new Set(products.flatMap((p) => p.colors))).sort();
}

/** "From ₦7,200 each at 6 pieces" — used on listing summaries. */
export function summarise(product: Product): string {
  const best = bestPriceFor(product);
  if (product.wholesaleMinQty === null) return "One price";
  return `From ${best.unitPrice} at ${best.minQty} pieces`;
}
