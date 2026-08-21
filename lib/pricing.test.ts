import assert from "node:assert/strict";
import test from "node:test";
import { bestPriceFor, tierProgress, unitPriceFor } from "./pricing.ts";
// The ladder invariants belong to the data we ship, so they run against the
// seed rather than a live Convex deployment.
import { PRODUCT_SEEDS as PRODUCTS } from "./catalog-seed.ts";

const laddered = {
  retailPrice: 8500,
  wholesaleMinQty: 6,
  priceTiers: [
    { minQty: 1, unitPrice: 8500 },
    { minQty: 4, unitPrice: 7900 },
    { minQty: 6, unitPrice: 7200 },
    { minQty: 12, unitPrice: 6600 },
  ],
};

const singleTier = {
  retailPrice: 5000,
  wholesaleMinQty: null,
  priceTiers: [{ minQty: 1, unitPrice: 5000 }],
};

test("applies the highest tier whose minQty is at or below the quantity", () => {
  assert.equal(unitPriceFor(laddered, 1).unitPrice, 8500);
  assert.equal(unitPriceFor(laddered, 3).unitPrice, 8500);
  assert.equal(unitPriceFor(laddered, 4).unitPrice, 7900);
  assert.equal(unitPriceFor(laddered, 5).unitPrice, 7900);
  assert.equal(unitPriceFor(laddered, 6).unitPrice, 7200);
  assert.equal(unitPriceFor(laddered, 11).unitPrice, 7200);
  assert.equal(unitPriceFor(laddered, 12).unitPrice, 6600);
  assert.equal(unitPriceFor(laddered, 500).unitPrice, 6600);
});

test("labels wholesale only at or above wholesaleMinQty", () => {
  assert.equal(unitPriceFor(laddered, 5).tier, "retail");
  assert.equal(unitPriceFor(laddered, 6).tier, "wholesale");
  assert.equal(unitPriceFor(laddered, 40).tier, "wholesale");
  assert.equal(unitPriceFor(singleTier, 100).tier, "retail");
});

test("line total is unit price times quantity, in whole naira", () => {
  const result = unitPriceFor(laddered, 6);
  assert.equal(result.lineTotal, 43_200);
  assert.equal(Number.isInteger(result.lineTotal), true);
});

test("nextTier reports the gap, the price and the saving", () => {
  const next = unitPriceFor(laddered, 4).nextTier;
  assert.ok(next);
  assert.equal(next.minQty, 6);
  assert.equal(next.unitPrice, 7200);
  assert.equal(next.qtyAway, 2);
  // Six pieces at 7,900 versus six at 7,200.
  assert.equal(next.saving, (7900 - 7200) * 6);
});

test("there is no next tier once the ladder is exhausted", () => {
  assert.equal(unitPriceFor(laddered, 12).nextTier, undefined);
  assert.equal(unitPriceFor(singleTier, 1).nextTier, undefined);
});

test("quantity is clamped to at least one and to whole pieces", () => {
  assert.equal(unitPriceFor(laddered, 0).unitPrice, 8500);
  assert.equal(unitPriceFor(laddered, -5).lineTotal, 8500);
  assert.equal(unitPriceFor(laddered, 4.9).unitPrice, 7900);
});

test("bestPriceFor returns the cheapest rung of the ladder", () => {
  assert.equal(bestPriceFor(laddered).unitPrice, 6600);
  assert.equal(bestPriceFor(laddered).minQty, 12);
  assert.equal(bestPriceFor(singleTier).unitPrice, 5000);
});

test("tier progress runs from zero at one piece to one at the last rung", () => {
  assert.equal(tierProgress(laddered, 1), 0);
  assert.equal(tierProgress(laddered, 12), 1);
  assert.equal(tierProgress(laddered, 100), 1);
  assert.equal(tierProgress(singleTier, 3), 1);
});

test("every catalogue product has a sorted ladder starting at one piece", () => {
  for (const product of PRODUCTS) {
    const tiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
    assert.equal(tiers[0]?.minQty, 1, `${product.slug} must start at 1 piece`);
    assert.equal(
      tiers[0]?.unitPrice,
      product.retailPrice,
      `${product.slug} tier 1 must equal the retail price`,
    );
    for (let i = 1; i < tiers.length; i++) {
      assert.ok(
        tiers[i]!.unitPrice <= tiers[i - 1]!.unitPrice,
        `${product.slug} prices must not go up as quantity goes up`,
      );
    }
    if (product.wholesaleMinQty !== null) {
      assert.ok(
        tiers.some((t) => t.minQty === product.wholesaleMinQty),
        `${product.slug} wholesale minimum must land on a real tier`,
      );
    }
  }
});
