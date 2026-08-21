import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Photo } from "@/components/product/photo";
import { BuyPanel } from "@/components/product/buy-panel";
import { MotionProvider } from "@/components/motion/provider";
import { ProductCard } from "@/components/product/product-card";
import { ProductEnquiry } from "@/components/product/product-enquiry";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/json-ld";
import { categoryBySlug, getProducts, productBySlug, relatedTo } from "@/lib/catalog";
import { toCardData } from "@/lib/card-data";
import { formatNaira } from "@/lib/format";
import { BUSINESS } from "@/lib/business";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(
  props: PageProps<"/product/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await productBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.seoTitle} | ${BUSINESS.name}`,
      description: product.seoDescription,
      url: `/product/${product.slug}`,
      images: [{ url: product.image.src, width: 1000, height: 1250 }],
    },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await productBySlug(slug);
  if (!product) notFound();

  const category = await categoryBySlug(product.categorySlug);
  const related = await relatedTo(product, 6);
  const tiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: category?.name ?? "Shop", href: `/category/${product.categorySlug}` },
          { name: product.name, href: `/product/${product.slug}` },
        ]}
      />

      <div className="shell pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/category/${product.categorySlug}`}
                className="hover:underline"
              >
                {category?.name ?? "Shop"}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <div className="shell mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Photo image={product.image} name={product.name} />

        <div>
          <h1 className="display text-[length:var(--text-display-m)]">
            {product.name}
          </h1>
          <p className="label mt-2 text-muted-foreground">SKU {product.sku}</p>
          <MotionProvider>
            <BuyPanel product={product} />
          </MotionProvider>
        </div>
      </div>

      <Reveal as="section" className="shell mt-16">
        <h2 className="display text-2xl">About this piece</h2>
        <p className="mt-4 max-w-[68ch] text-lg">{product.description}</p>
        <dl className="mt-8 grid max-w-[68ch] gap-4 sm:grid-cols-2">
          <div>
            <dt className="label text-muted-foreground">Material</dt>
            <dd className="mt-1">{product.material}</dd>
          </div>
          <div>
            <dt className="label text-muted-foreground">Care</dt>
            <dd className="mt-1">{product.careInstructions}</dd>
          </div>
        </dl>
        <ProductEnquiry product={product} />
      </Reveal>

      {tiers.length > 1 ? (
        <Reveal as="section" className="shell mt-16">
          <h2 className="display text-2xl">The price ladder</h2>
          <p className="mt-2 max-w-[60ch] text-muted-foreground">
            {product.wholesaleMinQty === null
              ? "This piece is sold at one price."
              : `Wholesale starts from ${product.wholesaleMinQty} pieces. Mix colours and sizes across this style — the ladder counts the total.`}
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <caption className="sr-only">
                Unit price by quantity for {product.name}
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="label py-3 text-muted-foreground">
                    Quantity
                  </th>
                  <th scope="col" className="label py-3 text-muted-foreground">
                    Price each
                  </th>
                  <th scope="col" className="label py-3 text-muted-foreground">
                    Tier
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => {
                  const wholesale =
                    product.wholesaleMinQty !== null &&
                    tier.minQty >= product.wholesaleMinQty;
                  return (
                    <tr key={tier.minQty} className="border-b border-border">
                      <td className="py-3 font-semibold tabular-nums">
                        {tier.minQty}
                        {tier.minQty === tiers[tiers.length - 1]?.minQty ? "+" : ""}{" "}
                        pieces
                      </td>
                      <td className="py-3 font-extrabold tabular-nums">
                        {formatNaira(tier.unitPrice)}
                      </td>
                      <td
                        className="py-3 font-bold"
                        style={{
                          color: wholesale
                            ? "var(--wholesale-ink)"
                            : "var(--muted-foreground)",
                        }}
                      >
                        {wholesale ? "Wholesale" : "Retail"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      ) : null}

      <Reveal as="section" className="shell mt-16">
        <h2 className="display text-2xl">Getting it to you</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-5">
            <h3 className="font-extrabold">Pickup</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {BUSINESS.address.street}, {BUSINESS.address.locality}.{" "}
              {BUSINESS.address.landmark}. Same-day collection when the piece is
              here.
            </p>
            <Link href="/visit-us" className="mt-3 inline-block font-bold hover:underline">
              See the shop and opening hours
            </Link>
          </div>
          <div className="rounded-md border border-border bg-card p-5">
            <h3 className="font-extrabold">Delivery</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The delivery page lists what each zone usually costs. The shop
              sets the fee for your order and confirms it on WhatsApp before you
              pay.
            </p>
            <Link href="/delivery" className="mt-3 inline-block font-bold hover:underline">
              See delivery zones and fees
            </Link>
          </div>
        </div>
      </Reveal>

      {related.length > 0 ? (
        <Reveal as="section" className="mt-20">
          <div className="shell">
            <h2 className="display text-[length:var(--text-display-m)]">
              You may also like
            </h2>
          </div>
          <div className="hairline mt-5" />
          <ul className="rail shell mt-6 pb-2">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard
                  product={toCardData(item)}
                  density="rail"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <RecentlyViewed excludeSlug={product.slug} />
    </>
  );
}
