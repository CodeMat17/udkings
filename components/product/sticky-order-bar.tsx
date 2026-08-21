"use client";

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { formatNaira } from "@/lib/format";
import { dur, ease } from "@/lib/motion";
import type { Product } from "@/lib/types";

/**
 * Appears on scroll past the fold. Fixed, so it never pushes layout and never
 * costs CLS — and it deliberately sits below the tier meter, because the meter
 * is what justifies the price this bar is showing.
 */
export function StickyOrderBar({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!shown) return null;

  return (
    <m.div
      initial={reduced ? false : { y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: dur.base, ease: ease.out }}
      className="fixed inset-x-0 bottom-14 z-30 border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="shell flex items-center gap-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{product.name}</p>
          <p className="font-extrabold tabular-nums">
            {formatNaira(product.retailPrice)}
            <span className="ml-1 text-xs font-semibold text-muted-foreground">
              per piece
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="ml-auto inline-flex h-12 shrink-0 items-center rounded-md bg-primary px-5 font-extrabold text-primary-foreground"
        >
          Add to cart
        </button>
      </div>
    </m.div>
  );
}
