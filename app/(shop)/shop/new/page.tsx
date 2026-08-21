import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/product-grid";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "New arrivals",
  description:
    "The newest pieces on the rail at UDKING'S Collections, Lagos Island. Fresh jeans, tops, gowns and sets, at retail and wholesale prices.",
  alternates: { canonical: "/shop/new" },
};

export default async function NewArrivalsPage() {
  const products = (await getProducts()).filter((p) => p.isNewArrival).sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <div className="shell py-10">
      <p className="label text-accent-ink">Just landed</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">New arrivals</h1>
      <p className="mt-4 max-w-[60ch] text-muted-foreground">
        Newest first. These move quickly — traders usually take the first
        delivery within the week.
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
