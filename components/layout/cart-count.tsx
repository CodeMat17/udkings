"use client";

import { useCart } from "@/lib/cart-store";

/** Reserves its box before hydration so the header never shifts. */
export function CartCount() {
  const { count, ready } = useCart();
  const show = ready && count > 0;

  return (
    <>
      <span className="sr-only">
        {show ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty"}
      </span>
      <span
        aria-hidden="true"
        className="absolute -top-1.5 -right-1.5 grid h-4 min-w-[1.375rem] place-items-center rounded-full px-1 text-[0.625rem] leading-none font-extrabold"
        style={{
          background: show ? "var(--accent-ink)" : "transparent",
          color: show ? "var(--background)" : "transparent",
        }}
      >
        {show ? (count > 99 ? "99+" : count) : "0"}
      </span>
    </>
  );
}
