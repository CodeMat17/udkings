import Link from "next/link";
import { GRID_CLASS, ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/card-data";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="display text-3xl">New pieces are on their way</p>
        <p className="mx-auto mt-3 max-w-[44ch] text-muted-foreground">
          Nothing here just now. Browse the full collection, or ask us on
          WhatsApp what has just landed.
        </p>
        <Link href="/shop" className="btn btn-outline mt-6">
          Shop all
        </Link>
      </div>
    );
  }

  return (
    <ul className={GRID_CLASS}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < 4} />
        </li>
      ))}
    </ul>
  );
}
