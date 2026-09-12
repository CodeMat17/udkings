import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { ProductGrid } from "@/components/shop/product-grid";
import { getProducts } from "@/lib/catalog";
import { toCardData } from "@/lib/card-data";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Best sellers",
  description:
    "The pieces Lagos reorders most from UDKING'S Collections. Retail and wholesale.",
  alternates: { canonical: "/shop/best-sellers" },
};

export default async function BestSellersPage() {
  const products = [...(await getProducts())]
    .sort((a, b) => b.orderCount - a.orderCount)
    .map(toCardData);

  return (
    <>
      <PageIntro eyebrow="What Lagos is buying" title="Best sellers">
        The pieces our customers come back for, most popular first.
      </PageIntro>
      <div className="shell">
        <ProductGrid products={products} />
      </div>
    </>
  );
}
