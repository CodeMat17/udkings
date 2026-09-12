"use client";

import { ShoppingBagIcon } from "lucide-react";
import { openBag, useBag } from "@/lib/bag";
import { cn } from "@/lib/utils";

/** Reserves its box before hydration so the header never shifts. */
export function BagButton({ className }: { className?: string }) {
  const { count, ready } = useBag();
  const show = ready && count > 0;

  return (
    <button
      type="button"
      onClick={openBag}
      aria-label={show ? `Open bag, ${count} ${count === 1 ? "item" : "items"}` : "Open bag"}
      className={cn("relative", className)}
    >
      <ShoppingBagIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.625rem] leading-none font-bold text-primary-foreground transition-transform duration-300",
          show ? "scale-100" : "scale-0",
        )}
      >
        {show ? (count > 99 ? "99+" : count) : ""}
      </span>
    </button>
  );
}
