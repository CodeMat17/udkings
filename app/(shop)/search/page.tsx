import Link from "next/link";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/product-grid";
import { getCategories, getProducts } from "@/lib/catalog";
import { applyQuery, readQuery } from "@/lib/filter";

export const metadata: Metadata = {
  title: "Search the catalogue",
  description:
    "Search UDKING'S Collections by product, colour, size or SKU. Ladies wear at retail and wholesale from Breadfruit Street, Lagos Island.",
  alternates: { canonical: "/search" },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;
  const query = readQuery(params);
  const term = query.q?.trim() ?? "";
  const products = term ? applyQuery(query, await getProducts()) : [];
  const categories = await getCategories();

  return (
    <div className="shell py-10">
      <p className="label text-accent-ink">Search</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        {term ? `Results for “${term}”` : "What are you looking for?"}
      </h1>

      {/* A plain GET form: it works before hydration, and on any connection. */}
      <form action="/search" role="search" className="mt-6 flex max-w-xl gap-2">
        <label htmlFor="q" className="sr-only">
          Search for a product, colour or size
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={term}
          placeholder="Jeans, size 14, black…"
          className="h-12 min-w-0 flex-1 rounded-sm border border-input bg-card px-3 text-base"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-md bg-primary px-6 font-extrabold text-primary-foreground"
        >
          Search
        </button>
      </form>

      {term ? (
        <>
          <p aria-live="polite" className="mt-6 font-semibold text-muted-foreground">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
          <ProductGrid products={products} />
        </>
      ) : (
        <div className="mt-8">
          <h2 className="label text-muted-foreground">Browse the rails instead</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-flex h-11 items-center rounded-sm border border-border px-4 font-semibold hover:bg-accent"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
