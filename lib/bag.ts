"use client";

import { useSyncExternalStore } from "react";
import { LocalStore } from "./local-store";
import { unitPriceFor } from "./pricing";
import type { ProductCardData } from "./card-data";
import type { PriceTier } from "./types";

/**
 * Bag, saved pieces and recently viewed — all of it lives in the browser.
 *
 * There is no checkout, no payment and no order record: the bag exists only to
 * become one WhatsApp message. So every line carries the few fields it needs to
 * render and estimate itself, and nothing here ever calls the server. Prices
 * can be a little stale in a bag that sat for a week; that is fine, because the
 * shop confirms availability and the final price in the chat.
 */

export type BagLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size?: string;
  quantity: number;
  retailPrice: number;
  priceTiers: PriceTier[];
  wholesaleMinQty: number | null;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function parseLines(raw: unknown): BagLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (line): line is BagLine =>
      isObject(line) &&
      typeof line.productId === "string" &&
      typeof line.name === "string" &&
      typeof line.quantity === "number" &&
      Array.isArray(line.priceTiers),
  );
}

function parseCards(raw: unknown): ProductCardData[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (card): card is ProductCardData =>
      isObject(card) &&
      typeof card.slug === "string" &&
      typeof card.image === "string" &&
      Array.isArray(card.priceTiers),
  );
}

const bag = new LocalStore<BagLine[]>("udk.bag.v2", [], parseLines);
const saved = new LocalStore<ProductCardData[]>("udk.saved.v2", [], parseCards);
const recent = new LocalStore<ProductCardData[]>("udk.recent.v2", [], parseCards);

function useStore<T>(store: LocalStore<T>) {
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  // An empty stored value leaves the snapshot identical, so hydration is
  // subscribed to separately or nothing would re-render to report it.
  const ready = useSyncExternalStore(store.subscribe, () => store.isHydrated, () => false);
  return [value, ready] as const;
}

/* ------------------------------------------------------------------ *
 * Bag
 * ------------------------------------------------------------------ */

/** The same style in two sizes is two lines: two different things to hand over. */
export const lineKey = (line: Pick<BagLine, "productId" | "size">) =>
  `${line.productId}|${line.size ?? ""}`;

const clampQty = (quantity: number) => Math.min(999, Math.max(1, Math.floor(quantity)));

export function addToBag(line: BagLine): void {
  const key = lineKey(line);
  bag.update((current) =>
    current.some((l) => lineKey(l) === key)
      ? current.map((l) =>
          lineKey(l) === key ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l,
        )
      : [...current, { ...line, quantity: clampQty(line.quantity) }],
  );
}

export function setBagQuantity(key: string, quantity: number): void {
  bag.update((current) =>
    current.map((l) => (lineKey(l) === key ? { ...l, quantity: clampQty(quantity) } : l)),
  );
}

export function removeFromBag(key: string): void {
  bag.update((current) => current.filter((l) => lineKey(l) !== key));
}

export function clearBag(): void {
  bag.set([]);
}

export function useBag() {
  const [lines, ready] = useStore(bag);
  return {
    lines,
    ready,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    estimate: lines.reduce((n, l) => n + unitPriceFor(l, l.quantity).lineTotal, 0),
  };
}

/* The slide-over is opened from the header, the bottom nav and "Add to bag". */
let bagOpen = false;
const openListeners = new Set<() => void>();

function setBagOpen(next: boolean): void {
  bagOpen = next;
  for (const listener of openListeners) listener();
}

export const openBag = () => setBagOpen(true);
export const closeBag = () => setBagOpen(false);

export function useBagOpen(): boolean {
  return useSyncExternalStore(
    (listener) => {
      openListeners.add(listener);
      return () => {
        openListeners.delete(listener);
      };
    },
    () => bagOpen,
    () => false,
  );
}

/* ------------------------------------------------------------------ *
 * Saved for later, and recently viewed
 * ------------------------------------------------------------------ */

export function useSaved() {
  const [items, ready] = useStore(saved);
  return { items, ready, has: (slug: string) => items.some((item) => item.slug === slug) };
}

/** Returns true when the piece was added, false when it was removed. */
export function toggleSaved(card: ProductCardData): boolean {
  let added = false;
  saved.update((current) => {
    added = !current.some((item) => item.slug === card.slug);
    return added ? [card, ...current] : current.filter((item) => item.slug !== card.slug);
  });
  return added;
}

export function rememberViewed(card: ProductCardData): void {
  recent.update((current) => [card, ...current.filter((c) => c.slug !== card.slug)].slice(0, 8));
}

export function useRecentlyViewed(): ProductCardData[] {
  return useStore(recent)[0];
}
