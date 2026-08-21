import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { toCardData } from "@/lib/card-data";
import type { Product } from "@/lib/types";

/**
 * The Rail: products hanging from a hairline rule, on native CSS scroll-snap.
 * A JS carousel would cost the performance budget and the keyboard audit.
 */
export function Rail({
  title,
  eyebrow,
  href,
  products,
}: {
  title: string;
  eyebrow: string;
  href: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <Reveal as="section" className="mt-16">
      <div className="shell">
        <p className="label text-accent-ink">{eyebrow}</p>
        <div className="mt-2 flex items-end justify-between gap-6">
          <h2 className="display text-[length:var(--text-display-m)]">{title}</h2>
          <Link
            href={href}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 font-bold whitespace-nowrap hover:underline"
          >
            See all {title.toLowerCase()}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="hairline mt-5" />

      <ul className="rail shell mt-6 pb-2">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={toCardData(product)}
              density="rail"
            />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
