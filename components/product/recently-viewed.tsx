"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { useRecentlyViewed } from "@/lib/wishlist-store";
import { productsBySlugs } from "@/app/actions";
import type { ProductCardData } from "@/lib/card-data";

/** Never leaves the device. Empty until the customer has actually looked around. */
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const slugs = useRecentlyViewed();
  const [products, setProducts] = useState<ProductCardData[]>([]);

  const wanted = slugs.filter((slug) => slug !== excludeSlug);
  const key = wanted.join(",");

  useEffect(() => {
    if (wanted.length === 0) return;
    let cancelled = false;
    void productsBySlugs(wanted).then((found) => {
      if (!cancelled) setProducts(found);
    });
    return () => {
      cancelled = true;
    };
    // `key` is the stable identity of the slug list.
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (products.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="shell">
        <h2 className="display text-[length:var(--text-display-m)]">
          Recently viewed
        </h2>
      </div>
      <div className="hairline mt-5" />
      <ul className="rail shell mt-6 pb-2">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} density="rail" />
          </li>
        ))}
      </ul>
    </section>
  );
}
