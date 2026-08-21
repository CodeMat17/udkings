import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/product-grid";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Best sellers",
  description:
    "The pieces Lagos reorders most from UDKING'S Collections — ranked by real order counts, not by guesswork. Retail and wholesale.",
  alternates: { canonical: "/shop/best-sellers" },
};

export default async function BestSellersPage() {
  const products = [...(await getProducts())].sort((a, b) => b.orderCount - a.orderCount);

  return (
    <div className="shell py-10">
      <p className="label text-accent-ink">What Lagos is buying</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">Best sellers</h1>
      <p className="mt-4 max-w-[60ch] text-muted-foreground">
        Ranked by how many pieces have actually left the shop, most first.
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
