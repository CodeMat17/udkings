"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { GRID_CLASS, ProductCard } from "@/components/product/product-card";
import {
  SORTS,
  applyQuery,
  readQuery,
  writeQuery,
  type ShopQuery,
  type SortValue,
} from "@/lib/filter";
import type { ProductCardData } from "@/lib/card-data";
import { cn } from "@/lib/utils";

const QUERY_EVENT = "udk:shop-query";

function subscribeToUrl(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(QUERY_EVENT, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(QUERY_EVENT, listener);
  };
}

const readUrlSearch = () => window.location.search;

/**
 * Search, category, wholesale and sort — entirely in the browser.
 *
 * The page around this is static HTML with every piece already in it, so a
 * visitor filtering the shop costs no server work at all. The filters live in
 * the address bar, so a filtered link sent on WhatsApp opens on the same view.
 */
export function CatalogueBrowser({
  products,
  categories = [],
}: {
  products: ProductCardData[];
  /** Omitted on a category page, where the category is already chosen. */
  categories?: { name: string; slug: string }[];
}) {
  // The address bar is the state. The server snapshot is the unfiltered view,
  // so the static HTML hydrates exactly and then settles on the URL's filters.
  const urlSearch = useSyncExternalStore(subscribeToUrl, readUrlSearch, () => "");
  const query = useMemo(() => readQuery(new URLSearchParams(urlSearch)), [urlSearch]);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // The header's search icon links to #search, including from this page.
    const focusSearch = () => {
      if (window.location.hash === "#search") search.current?.focus();
    };
    focusSearch();
    window.addEventListener("hashchange", focusSearch);
    return () => window.removeEventListener("hashchange", focusSearch);
  }, []);

  function update(patch: Partial<ShopQuery>) {
    const next = { ...query, ...patch };
    window.history.replaceState(null, "", `${window.location.pathname}${writeQuery(next)}`);
    window.dispatchEvent(new Event(QUERY_EVENT));
  }

  const results = useMemo(() => applyQuery(query, products), [query, products]);
  const filtered = Boolean(query.q || query.category || query.wholesale);
  const clear = () => update({ q: "", category: "", wholesale: false });

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md md:-mx-6 md:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="relative flex min-w-0 flex-1 basis-56 items-center">
            <span className="sr-only">Search the collection</span>
            <SearchIcon
              className="pointer-events-none absolute left-4 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="search"
              ref={search}
              type="search"
              value={query.q}
              onChange={(event) => update({ q: event.target.value })}
              placeholder="Search gowns, jeans, size 14…"
              className="h-11 w-full rounded-full border border-border bg-card pr-4 pl-10 text-[0.9375rem] transition-colors outline-none placeholder:text-muted-foreground focus:border-foreground"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Sort pieces</span>
            <select
              value={query.sort}
              onChange={(event) => update({ sort: event.target.value as SortValue })}
              className="h-11 cursor-pointer appearance-none rounded-full border border-border bg-card pr-10 pl-4 text-sm font-medium outline-none focus:border-foreground"
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
          </label>
        </div>

        {categories.length > 0 ? (
          <div role="group" aria-label="Filter by category" className="rail mt-3 gap-2">
            <button
              type="button"
              aria-pressed={!query.category}
              onClick={() => update({ category: "" })}
              className="chip"
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                aria-pressed={query.category === category.slug}
                onClick={() =>
                  update({ category: query.category === category.slug ? "" : category.slug })
                }
                className="chip"
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex min-h-6 items-center justify-between gap-4 text-sm text-muted-foreground">
        <p aria-live="polite">
          {results.length} {results.length === 1 ? "piece" : "pieces"}
        </p>
        {filtered ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <XIcon className="size-3.5" aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <p className="display text-3xl">Nothing matches that</p>
          <p className="mx-auto mt-3 max-w-[46ch] text-muted-foreground">
            Try another word, or clear the filters. Looking for something
            specific? Ask us on WhatsApp — new pieces land every week.
          </p>
          <button type="button" onClick={clear} className="btn btn-outline mt-6">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className={cn(GRID_CLASS, "mt-6")}>
          {results.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
