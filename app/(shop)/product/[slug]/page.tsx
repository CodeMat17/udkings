import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Photo } from "@/components/product/photo";
import { BuyPanel } from "@/components/product/buy-panel";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { Rail } from "@/components/home/rail";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/json-ld";
import { categoryBySlug, getProducts, productBySlug, relatedTo } from "@/lib/catalog";
import { toCardData } from "@/lib/card-data";
import { BUSINESS } from "@/lib/business";

/**
 * Prerendered for every product at build; a product added later renders on its
 * first visit and is cached from then on. An admin save expires the cache.
 */
export const revalidate = 86400;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
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

function Disclosure({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium">
        {title}
        <PlusIcon
          className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-45"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </summary>
      <div className="pb-6 text-[0.9375rem] leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await productBySlug(slug);
  if (!product) notFound();

  const [category, related] = await Promise.all([
    categoryBySlug(product.categorySlug),
    relatedTo(product),
  ]);

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

      <div className="shell pt-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/category/${product.categorySlug}`} className="hover:text-foreground">
                {category?.name ?? "Shop"}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="shell mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Photo image={product.image} name={product.name} />
        </div>

        <div className="lg:pt-4">
          {category ? (
            <Link href={`/category/${category.slug}`} className="label text-muted-foreground hover:text-foreground">
              {category.name}
            </Link>
          ) : null}
          <h1 className="display mt-3 text-[length:var(--text-display-m)] text-balance">{product.name}</h1>

          <BuyPanel product={product} />

          <div className="mt-10 divide-y divide-border border-y border-border">
            <Disclosure title="Description" open>
              {product.description ||
                "Ask us on WhatsApp for fabric, fit and measurements — we reply during shop hours."}
            </Disclosure>

            <Disclosure title="Delivery & pickup">
              Free pickup at {BUSINESS.address.street}, {BUSINESS.address.locality} —{" "}
              {BUSINESS.address.landmark.toLowerCase()}. We deliver anywhere in
              Nigeria; the fee is agreed with you on WhatsApp before you pay.{" "}
              <Link href="/visit-us" className="text-foreground underline underline-offset-4">
                Opening hours
              </Link>
            </Disclosure>

            <Disclosure title="Exchanges">
              Bring an unworn piece with its tags back to the shop within three
              days and we will exchange it for another size, or another piece of
              the same value.
            </Disclosure>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Ref. {product.sku}</p>
        </div>
      </div>

      <Rail
        eyebrow="Complete the look"
        title="You may also like"
        href={`/category/${product.categorySlug}`}
        products={related.map(toCardData)}
      />

      <RecentlyViewed excludeSlug={product.slug} />
    </>
  );
}
