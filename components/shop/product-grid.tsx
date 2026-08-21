import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { getCategories } from "@/lib/catalog";
import { toCardData } from "@/lib/card-data";
import type { Product } from "@/lib/types";

export async function ProductGrid({ products }: { products: Product[] }) {
  const categories = await getCategories();
  if (products.length === 0) {
    /* An empty result is an invitation, not an apology. */
    return (
      <div className="mt-10 rounded-md border border-border bg-card p-8">
        <h2 className="display text-2xl">Nothing matches that combination</h2>
        <p className="mt-2 max-w-[52ch] text-muted-foreground">
          Try one filter fewer, or start from a category — every rail in the
          shop is one tap away.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex h-11 items-center rounded-sm border border-border px-4 font-semibold hover:bg-accent"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <Reveal index={Math.min(index, 5)}>
            <ProductCard
              product={toCardData(product)}
              density="grid"
              priority={index < 2}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
