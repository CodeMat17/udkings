import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CategoryTabs } from "@/components/shop/category-tabs";
import { CatalogueBrowser } from "@/components/shop/catalogue-browser";
import { categoryBySlug, getCategories, productsInCategory } from "@/lib/catalog";
import { toCardData } from "@/lib/card-data";

/**
 * Prerendered for every category at build. A category added later renders once
 * on its first visit and is cached from then on (ISR).
 */
export const revalidate = 86400;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(props: PageProps<"/category/[slug]">): Promise<Metadata> {
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

  const [categories, products] = await Promise.all([
    getCategories(),
    productsInCategory(category.slug).then((items) => items.map(toCardData)),
  ]);

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: category.name, href: `/category/${category.slug}` },
        ]}
      />

      <section className="shell pt-10 sm:pt-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/shop" className="hover:text-foreground">Shop</Link>
            </li>
          </ol>
        </nav>
        <h1 className="display mt-4 text-[length:var(--text-display-l)]">{category.name}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "piece" : "pieces"} · retail &amp; wholesale
        </p>
        <CategoryTabs categories={categories} current={category.slug} className="mt-6" />
      </section>

      <div className="shell pt-6">
        <CatalogueBrowser products={products} />
      </div>
    </>
  );
}
