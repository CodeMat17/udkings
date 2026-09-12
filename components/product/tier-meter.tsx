"use client";

import { tierProgress, unitPriceFor } from "@/lib/pricing";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/lib/types";

/** The wholesale ladder, filling toward the next rung as the quantity rises. */
export function TierMeter({ product, quantity }: { product: Product; quantity: number }) {
  const tiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
  if (tiers.length < 2) return null;

  const result = unitPriceFor(product, quantity);
  const unlocked = result.tier === "wholesale";
  const colour = unlocked ? "var(--wholesale-ink)" : "var(--foreground)";

  return (
    <section aria-label="Wholesale price ladder" className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-5">
      <p className="label text-muted-foreground">Buy more, pay less</p>

      <div className="relative mt-4 h-1 rounded-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-500 ease-out"
          style={{ width: `${Math.round(tierProgress(product, quantity) * 100)}%`, background: colour }}
        />
      </div>

      <ul
        className="mt-3 grid gap-2 text-xs tabular-nums"
        style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}
      >
        {tiers.map((tier, index) => (
          <li
            key={tier.minQty}
            className={
              (index === 0 ? "text-left " : index === tiers.length - 1 ? "text-right " : "text-center ") +
              (quantity >= tier.minQty ? "font-semibold text-foreground" : "text-muted-foreground")
            }
          >
            <span className="block">{tier.minQty}+ pcs</span>
            <span className="block">{formatNaira(tier.unitPrice)}</span>
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="mt-4 text-sm" style={{ color: unlocked ? "var(--wholesale-ink)" : undefined }}>
        {result.nextTier
          ? `Add ${result.nextTier.qtyAway} more for ${formatNaira(result.nextTier.unitPrice)} each — you save ${formatNaira(result.nextTier.saving)}.`
          : unlocked
            ? `You're on our best wholesale price at ${quantity} pieces.`
            : `${quantity} ${quantity === 1 ? "piece" : "pieces"} at the retail price.`}
      </p>
    </section>
  );
}
