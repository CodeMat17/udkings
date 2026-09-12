import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { CatalogueBrowser } from "@/components/shop/catalogue-browser";
import { getCategories, getProducts } from "@/lib/catalog";
import { toCardData } from "@/lib/card-data";

/**
 * Static. Search, category, wholesale and sort run in the browser over the
 * catalogue rendered here, so no visitor ever triggers a server render.
 */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Shop all ladies wear",
  description:
    "The full UDKING'S Collections catalogue — gowns, jeans, tops, skirts, bump shorts, jackets, trousers and sets, at retail and wholesale prices.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <>
      <PageIntro eyebrow="The collection" title="Shop all">
        Every piece in the shop, with retail and wholesale prices side by side.
      </PageIntro>
      <div className="shell">
        <CatalogueBrowser
          products={products.map(toCardData)}
          categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        />
      </div>
    </>
  );
}
