"use client";

import { useCallback, useSyncExternalStore } from "react";
import { LocalStore } from "./local-store";

function parseSlugs(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : [];
}

const wishlist = new LocalStore<string[]>("udk.wishlist.v1", [], parseSlugs);
const recent = new LocalStore<string[]>("udk.recent.v1", [], parseSlugs);

export function useWishlist() {
  const slugs = useSyncExternalStore(
    wishlist.subscribe,
    wishlist.getSnapshot,
    wishlist.getServerSnapshot,
  );

  const ready = useSyncExternalStore(
    wishlist.subscribe,
    () => wishlist.isHydrated,
    () => false,
  );

  const toggle = useCallback((slug: string) => {
    const added = !wishlist.getSnapshot().includes(slug);
    wishlist.update((current) =>
      added ? [...current, slug] : current.filter((s) => s !== slug),
    );
    return added;
  }, []);

  const remove = useCallback((slug: string) => {
    wishlist.update((current) => current.filter((s) => s !== slug));
  }, []);

  return {
    slugs,
    ready,
    has: (slug: string) => slugs.includes(slug),
    toggle,
    remove,
  };
}

/** Recently viewed — mobile-prominent, and never leaves the device. */
export function rememberViewed(slug: string): void {
  recent.update((current) => [slug, ...current.filter((s) => s !== slug)].slice(0, 8));
}

export function useRecentlyViewed(): string[] {
  return useSyncExternalStore(
    recent.subscribe,
    recent.getSnapshot,
    recent.getServerSnapshot,
  );
}
