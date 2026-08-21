import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "All categories",
  description:
    "Every rail at UDKING'S Collections — jeans, tops, gowns, skirts, bump shorts, jackets, trousers and two-piece sets, retail and wholesale in Lagos Island.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const products = await getProducts();
  const countIn = (slug: string) =>
    products.filter((p) => p.categorySlug === slug).length;
  return (
    <div className="shell py-10">
      <p className="label text-accent-ink">The rails</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        All categories
      </h1>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <li key={category.slug}>
            <Reveal index={Math.min(index, 5)}>
              <Link
                href={`/category/${category.slug}`}
                className="group block overflow-hidden rounded-md border border-border"
              >
                <span className="relative block aspect-[3/2]">
                  <Image
                    src={category.heroImage}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 380px"
                    loading={index < 3 ? undefined : "lazy"}
                    priority={index < 3}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </span>
                <span className="block bg-card p-5">
                  <span className="block text-lg font-extrabold">
                    {category.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {category.description}
                  </span>
                  <span className="label mt-3 block text-accent-ink">
                    {countIn(category.slug)} styles
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
