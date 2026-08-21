import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FilterBar } from "@/components/shop/filter-bar";
import { ProductGrid } from "@/components/shop/product-grid";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { categoryBySlug, getCategories, productsInCategory } from "@/lib/catalog";
import { applyQuery, readQuery } from "@/lib/filter";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(
  props: PageProps<"/category/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await categoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const category = await categoryBySlug(slug);
  if (!category) notFound();

  const params = await props.searchParams;
  const query = readQuery(params);
  const products = applyQuery(
    { ...query, category: undefined },
    await productsInCategory(category.slug),
  );

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: category.name, href: `/category/${category.slug}` },
        ]}
      />

      {/* Editorial opener: one full-bleed image, no motion above the fold. */}
      <section className="relative isolate flex min-h-[46svh] items-end overflow-hidden bg-[var(--indigo-900)] text-white">
        <Image
          src={category.heroImage}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="scrim absolute inset-0 -z-10" />
        <div className="shell py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-white/80">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{category.name}</li>
            </ol>
          </nav>
          <h1 className="display mt-4 text-[length:var(--text-display-l)]">
            {category.name}
          </h1>
          <p className="mt-4 max-w-[52ch] text-white/85">{category.description}</p>
        </div>
      </section>

      <div className="shell py-10">
        <Suspense fallback={<div className="h-11" />}>
          <FilterBar
            lockedCategory={category.slug}
            resultCount={products.length}
            categories={[]}
          />
        </Suspense>
        <ProductGrid products={products} />
      </div>
    </>
  );
}
