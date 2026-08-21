"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartIcon, MessageCircleIcon, XIcon } from "lucide-react";
import { ProductCard } from "./product-card";
import { useWishlist } from "@/lib/wishlist-store";
import { productsBySlugs } from "@/app/actions";
import { composeWishlistMessage } from "@/lib/whatsapp";
import { waLink } from "@/lib/business";
import type { ProductCardData } from "@/lib/card-data";

export function WishlistView({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const { slugs, ready, remove } = useWishlist();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const key = slugs.join(",");

  useEffect(() => {
    if (slugs.length === 0) return;
    let cancelled = false;
    void productsBySlugs(slugs).then((found) => {
      if (!cancelled) setProducts(found);
    });
    return () => {
      cancelled = true;
    };
    // `key` is the stable identity of the saved slug list.
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <div className="mt-8 h-64" />;

  if (products.length === 0) {
    return (
      <>
        <p className="mt-4 flex max-w-[56ch] items-start gap-3 text-muted-foreground">
          <HeartIcon className="mt-1 size-5 shrink-0 text-accent-ink" aria-hidden="true" />
          The heart on any product saves it here. When you are ready, send the
          whole list to us on WhatsApp and ask what is still in stock.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
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
      </>
    );
  }

  return (
    <>
      <a
        href={waLink(composeWishlistMessage(products.map((p) => p.name)))}
        target="_blank"
        rel="noopener"
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-md px-6 font-extrabold"
        style={{ background: "var(--stock-ink)", color: "var(--background)" }}
      >
        <MessageCircleIcon className="size-5" aria-hidden="true" />
        Ask if these are still available
        <span className="sr-only">, opens WhatsApp in a new tab</span>
      </a>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id} className="relative">
            <ProductCard product={product} density="grid" />
            <button
              type="button"
              onClick={() => remove(product.slug)}
              aria-label={`Remove ${product.name} from your wishlist`}
              className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-background/90"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
