"use client";

import { m, useReducedMotion } from "framer-motion";
import { tierProgress, unitPriceFor } from "@/lib/pricing";
import { formatNaira } from "@/lib/format";
import { spring } from "@/lib/motion";
import type { Product } from "@/lib/types";

/**
 * The one place this design is allowed to show off, because it encodes the
 * thing that makes this business different: the wholesale ladder, stated in
 * words, filling toward the next rung as the stepper increments.
 */
export function TierMeter({ product, quantity }: { product: Product; quantity: number }) {
  const reduced = useReducedMotion();
  const tiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
  const last = tiers[tiers.length - 1];
  const result = unitPriceFor(product, quantity);
  const progress = tierProgress(product, quantity);
  const unlocked = result.tier === "wholesale";

  if (!last || tiers.length < 2) return null;

  return (
    <section aria-label="Wholesale price ladder" className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-2xl font-extrabold tabular-nums">
          {formatNaira(result.unitPrice)}
          <span className="ml-1.5 text-sm font-semibold text-muted-foreground">
            each
          </span>
        </p>
        <p className="text-sm font-bold tabular-nums text-muted-foreground">
          {formatNaira(last.unitPrice)} at {last.minQty} pcs
        </p>
      </div>

      <div className="relative mt-3 h-2 rounded-full bg-secondary">
        <m.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: unlocked
              ? "var(--wholesale-ink)"
              : "var(--accent-ink)",
          }}
          initial={false}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={reduced ? { duration: 0 } : spring}
        />
        {tiers.map((tier) => {
          const at =
            last.minQty > 1 ? ((tier.minQty - 1) / (last.minQty - 1)) * 100 : 0;
          const reached = quantity >= tier.minQty;
          return (
            <span
              key={tier.minQty}
              aria-hidden="true"
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
              style={{
                left: `${at}%`,
                background: reached
                  ? tier.minQty >= (product.wholesaleMinQty ?? Infinity)
                    ? "var(--wholesale-ink)"
                    : "var(--accent-ink)"
                  : "var(--border)",
              }}
            />
          );
        })}
      </div>

      <ul className="mt-2 flex flex-wrap justify-between gap-x-2 text-xs font-bold text-muted-foreground tabular-nums">
        {tiers.map((tier) => (
          <li key={tier.minQty}>{tier.minQty} pcs</li>
        ))}
      </ul>

      {/* Colour is never the only signal — the threshold is always in words. */}
      <p
        aria-live="polite"
        className="mt-3 text-sm font-semibold"
        style={{ color: unlocked ? "var(--wholesale-ink)" : "var(--muted-foreground)" }}
      >
        {result.nextTier
          ? `Add ${result.nextTier.qtyAway} more to unlock ${formatNaira(result.nextTier.unitPrice)} each — you save ${formatNaira(result.nextTier.saving)}.`
          : unlocked
            ? `You are on the wholesale price at ${quantity} pieces. This is the best rate we do.`
            : `You are buying ${quantity} ${quantity === 1 ? "piece" : "pieces"} at the retail price.`}
      </p>
    </section>
  );
}
