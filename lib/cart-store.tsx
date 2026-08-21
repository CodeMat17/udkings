"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { validateCart } from "@/app/actions";
import { LocalStore } from "./local-store";
import { unitPriceFor } from "./pricing";
import { formatNaira } from "./format";
import type { CartLine, OrderItem } from "./types";

const KEY = "udk.cart.v1";

export type PricedLine = CartLine & {
  unitPrice: number;
  appliedTier: "retail" | "wholesale";
  lineTotal: number;
};

function parseLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (line): line is CartLine =>
      typeof line === "object" &&
      line !== null &&
      "productId" in line &&
      "colors" in line &&
      "sizes" in line &&
      "priceTiers" in line,
  );
}

const store = new LocalStore<CartLine[]>(KEY, [], parseLines);

/**
 * One line per product *and* chosen colour and size — the same style in two
 * colours is two lines, because they are two different things to hand over.
 * Lines added before choosing existed key on the product alone.
 */
export function lineKey(line: Pick<CartLine, "productId" | "color" | "size">) {
  return `${line.productId}|${line.color ?? ""}|${line.size ?? ""}`;
}

function sameLine(line: CartLine, key: string) {
  return lineKey(line) === key;
}

export function useCart() {
  const lines = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  // Hydration has to be subscribed to as well: an empty stored cart leaves the
  // snapshot identical, so nothing else would ever re-render to report it.
  const ready = useSyncExternalStore(
    store.subscribe,
    () => store.isHydrated,
    () => false,
  );

  const add = useCallback((line: CartLine) => {
    const key = lineKey(line);
    store.update((current) => {
      const existing = current.find((l) => sameLine(l, key));
      if (!existing) {
        return [...current, line];
      }
      return current.map((l) =>
        sameLine(l, key) ? { ...l, quantity: l.quantity + line.quantity } : l,
      );
    });
  }, []);

  const setQuantity = useCallback((key: string, qty: number) => {
    store.update((current) =>
      current.map((l) =>
        sameLine(l, key) ? { ...l, quantity: Math.max(1, qty) } : l,
      ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    store.update((current) => current.filter((l) => !sameLine(l, key)));
  }, []);

  /** Swapping the colour or size of a line already in the cart. */
  const setChoice = useCallback(
    (key: string, choice: { color?: string; size?: string }) => {
      store.update((current) => {
        const target = current.find((l) => sameLine(l, key));
        if (!target) return current;
        // An empty selection is "not chosen", never an empty string on the order.
        const next: CartLine = {
          ...target,
          ...("color" in choice ? { color: choice.color || undefined } : {}),
          ...("size" in choice ? { size: choice.size || undefined } : {}),
        };
        const nextKey = lineKey(next);
        if (nextKey === key) return current;
        // The chosen combination may already be in the cart: merge into it.
        const merged = current.find((l) => lineKey(l) === nextKey);
        if (merged) {
          return current
            .filter((l) => !sameLine(l, key))
            .map((l) =>
              lineKey(l) === nextKey
                ? { ...l, quantity: l.quantity + next.quantity }
                : l,
            );
        }
        return current.map((l) => (sameLine(l, key) ? next : l));
      });
    },
    [],
  );

  const clear = useCallback(() => store.set([]), []);

  const priced = useMemo<PricedLine[]>(
    () =>
      lines.map((line) => {
        const result = unitPriceFor(line, line.quantity);
        return {
          ...line,
          unitPrice: result.unitPrice,
          appliedTier: result.tier,
          lineTotal: result.lineTotal,
        };
      }),
    [lines],
  );

  return {
    lines,
    priced,
    ready,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: priced.reduce((n, l) => n + l.lineTotal, 0),
    add,
    setQuantity,
    setChoice,
    remove,
    clear,
    toOrderItems: (): OrderItem[] =>
      priced.map((l) => ({
        productId: l.productId,
        productName: l.name,
        slug: l.slug,
        image: l.image,
        colors: l.colors,
        sizes: l.sizes,
        ...(l.color ? { color: l.color } : {}),
        ...(l.size ? { size: l.size } : {}),
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        appliedTier: l.appliedTier,
        lineTotal: l.lineTotal,
      })),
  };
}

/**
 * Revalidates the stored cart against the server once, wherever the cart is
 * actually shown. Products get deleted, prices change and the colours and sizes
 * a piece comes in change while a cart sits in localStorage; every adjustment is
 * announced plainly.
 */
export function useCartValidation(): boolean {
  const [checked, setChecked] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Never cancelled: under StrictMode the first effect is torn down and the
    // second run is the no-op, so aborting the in-flight check would leave the
    // cart stuck on its skeleton forever.
    void (async () => {
      try {
        const stored = store.getSnapshot();
        if (stored.length > 0) {
          const result = await validateCart(stored);
          store.set(result.lines);
          for (const notice of result.notices) toast.warning(notice);
        }
      } catch {
        // The cart in hand is still usable, and the server prices it again at
        // checkout — that pass is the one that counts.
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  return checked;
}

/** "Now ₦8,500 each — you're below the 6-piece wholesale price." */
export function reTieringNotice(line: PricedLine): string | null {
  if (line.wholesaleMinQty === null) return null;
  if (line.appliedTier === "wholesale") return null;
  if (line.wholesaleMinQty - line.quantity <= 0) return null;
  return `Now ${formatNaira(line.unitPrice)} each — you're below the ${line.wholesaleMinQty}-piece wholesale price.`;
}
