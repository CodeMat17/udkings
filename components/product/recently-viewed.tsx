"use client";

import { ProductCard } from "./product-card";
import { useRecentlyViewed } from "@/lib/bag";

/** Read from this device only — no server call, ever. */
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const products = useRecentlyViewed().filter((product) => product.slug !== excludeSlug);
  if (products.length === 0) return null;

  return (
    <section className="mt-20 sm:mt-28">
      <div className="shell">
        <p className="label text-muted-foreground">Pick up where you left off</p>
        <h2 className="display mt-3 text-[length:var(--text-display-m)]">Recently viewed</h2>
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
