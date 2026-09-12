import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/card-data";

/** A titled row of products on native CSS scroll-snap. */
export function Rail({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="reveal mt-20 sm:mt-28">
      <div className="shell flex items-end justify-between gap-6">
        <div>
          <p className="label text-muted-foreground">{eyebrow}</p>
          <h2 className="display mt-3 text-[length:var(--text-display-m)]">{title}</h2>
        </div>
        <Link
          href={href}
          className="link-underline inline-flex shrink-0 items-center gap-1.5 text-sm font-medium"
        >
          View all
          <ArrowRightIcon className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>

      <ul className="rail shell mt-8 sm:gap-5">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} rail />
          </li>
        ))}
      </ul>
    </section>
  );
}
