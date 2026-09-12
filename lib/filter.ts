import type { ProductCardData } from "./card-data";

export const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

export type ShopQuery = {
  q: string;
  category: string;
  wholesale: boolean;
  sort: SortValue;
};

export const EMPTY_QUERY: ShopQuery = { q: "", category: "", wholesale: false, sort: "newest" };

export function readQuery(params: URLSearchParams): ShopQuery {
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    wholesale: params.get("wholesale") === "1",
    sort: SORTS.some((s) => s.value === sort) ? (sort as SortValue) : "newest",
  };
}

/** The query as a search string — "" when nothing differs from the default view. */
export function writeQuery(query: ShopQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.wholesale) params.set("wholesale", "1");
  if (query.sort !== "newest") params.set("sort", query.sort);
  const out = params.toString();
  return out ? `?${out}` : "";
}

/** Pure, and runs in the browser over the statically rendered catalogue. */
export function applyQuery(query: ShopQuery, source: ProductCardData[]): ProductCardData[] {
  const q = query.q.trim().toLowerCase();
  const results = source.filter(
    (p) =>
      (!q || [p.name, p.categorySlug, ...p.sizes].join(" ").toLowerCase().includes(q)) &&
      (!query.category || p.categorySlug === query.category) &&
      (!query.wholesale || p.wholesaleMinQty !== null),
  );

  switch (query.sort) {
    case "price_asc":
      return results.sort((a, b) => a.retailPrice - b.retailPrice);
    case "price_desc":
      return results.sort((a, b) => b.retailPrice - a.retailPrice);
    case "popular":
      return results.sort((a, b) => b.orderCount - a.orderCount);
    default:
      return results.sort((a, b) => b.createdAt - a.createdAt);
  }
}
