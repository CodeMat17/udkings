import type { Product, PriceTier } from "./types";

export type NextTier = {
  minQty: number;
  unitPrice: number;
  qtyAway: number;
  /** What the customer saves in total by reaching the next tier at its minQty. */
  saving: number;
};

export type PriceResult = {
  unitPrice: number;
  tier: "retail" | "wholesale";
  lineTotal: number;
  nextTier?: NextTier;
};

type Priceable = Pick<Product, "retailPrice" | "priceTiers" | "wholesaleMinQty">;

function sortedTiers(product: Priceable): PriceTier[] {
  const tiers =
    product.priceTiers.length > 0
      ? [...product.priceTiers]
      : [{ minQty: 1, unitPrice: product.retailPrice }];
  return tiers.sort((a, b) => a.minQty - b.minQty);
}

/**
 * The single source of truth for money. Used identically on the product page,
 * in the cart, at checkout and when the order is created. The client's number
 * and the server's number must never disagree.
 */
export function unitPriceFor(product: Priceable, qty: number): PriceResult {
  const quantity = Math.max(1, Math.floor(qty));
  const tiers = sortedTiers(product);

  // The applicable tier is the highest whose minQty <= qty.
  let applied = tiers[0] ?? { minQty: 1, unitPrice: product.retailPrice };
  for (const tier of tiers) {
    if (tier.minQty <= quantity) applied = tier;
  }

  const isWholesale =
    product.wholesaleMinQty !== null && quantity >= product.wholesaleMinQty;

  const upcoming = tiers.find((t) => t.minQty > quantity);
  const nextTier: NextTier | undefined = upcoming
    ? {
        minQty: upcoming.minQty,
        unitPrice: upcoming.unitPrice,
        qtyAway: upcoming.minQty - quantity,
        saving: (applied.unitPrice - upcoming.unitPrice) * upcoming.minQty,
      }
    : undefined;

  return {
    unitPrice: applied.unitPrice,
    tier: isWholesale ? "wholesale" : "retail",
    lineTotal: applied.unitPrice * quantity,
    ...(nextTier ? { nextTier } : {}),
  };
}

/** The lowest unit price a product ever reaches — "from ₦7,200 at 6 pieces". */
export function bestPriceFor(product: Priceable): PriceTier {
  const tiers = sortedTiers(product);
  return tiers.reduce((low, t) => (t.unitPrice < low.unitPrice ? t : low), tiers[0]!);
}

/** Where the customer sits along the wholesale ladder, 0 → 1. Drives the Tier Meter. */
export function tierProgress(product: Priceable, qty: number): number {
  const tiers = sortedTiers(product);
  const last = tiers[tiers.length - 1]!;
  if (last.minQty <= 1) return 1;
  const clamped = Math.min(Math.max(qty, 1), last.minQty);
  return (clamped - 1) / (last.minQty - 1);
}
