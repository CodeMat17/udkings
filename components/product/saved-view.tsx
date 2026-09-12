"use client";

import Link from "next/link";
import { HeartIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { GRID_CLASS, ProductCard } from "./product-card";
import { useSaved } from "@/lib/bag";
import { composeSavedMessage } from "@/lib/whatsapp";
import { waLink } from "@/lib/business";

export function SavedView() {
  const { items, ready } = useSaved();

  if (!ready) return <div className="mt-10 h-72" />;

  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-secondary">
          <HeartIcon className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="display mt-6 text-3xl">Nothing saved yet</p>
        <p className="mt-2 max-w-[40ch] text-muted-foreground">
          Tap the heart on any piece to keep it here. Saved pieces stay on this
          device only.
        </p>
        <Link href="/shop" className="btn btn-primary mt-8">
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <p className="text-sm text-muted-foreground">
          {items.length} saved {items.length === 1 ? "piece" : "pieces"}
        </p>
        <a
          href={waLink(composeSavedMessage(items.map((item) => item.name)))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp h-11"
        >
          <WhatsAppIcon className="size-4" aria-hidden="true" />
          Ask if these are available
        </a>
      </div>
      <ul className={`${GRID_CLASS} mt-10`}>
        {items.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}
