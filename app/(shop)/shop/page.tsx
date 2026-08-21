import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterBar } from "@/components/shop/filter-bar";
import { ProductGrid } from "@/components/shop/product-grid";
import { applyQuery, readQuery } from "@/lib/filter";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop all ladies wear",
  description:
    "The full UDKING'S Collections catalogue — jeans, tops, gowns, skirts, bump shorts, jackets, trousers and sets. Filter by category and wholesale.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage(props: PageProps<"/shop">) {
  const params = await props.searchParams;
  const query = readQuery(params);
  const products = applyQuery(query, await getProducts());

  return (
    <div className="shell py-10">
      <p className="label text-accent-ink">The catalogue</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        {query.q ? `Results for “${query.q}”` : "Everything in the shop"}
      </h1>
      <p className="mt-4 max-w-[60ch] text-muted-foreground">
        Filters live in the address bar, so you can send this exact view to
        somebody on WhatsApp and they will see what you see.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-11" />}>
          <FilterBar
            resultCount={products.length}
            categories={(await getCategories()).map((c) => ({ name: c.name, slug: c.slug }))}
          />
        </Suspense>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
