"use client";

import { MinusIcon, PlusIcon } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  max = 999,
  label = "Quantity",
  size = "lg",
}: {
  value: number;
  onChange: (next: number) => void;
  /** A guard rail, not stock. Anything larger is settled on WhatsApp. */
  max?: number;
  label?: string;
  size?: "lg" | "sm";
}) {
  const dim = size === "lg" ? "size-12" : "size-11";

  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={`${dim} grid place-items-center rounded-l-md disabled:opacity-40`}
      >
        <MinusIcon className="size-4" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        aria-label={`${label}: ${value}`}
        className="min-w-12 px-1 text-center text-lg font-extrabold tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={`${dim} grid place-items-center rounded-r-md disabled:opacity-40`}
      >
        <PlusIcon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
