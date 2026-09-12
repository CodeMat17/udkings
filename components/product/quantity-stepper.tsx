"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const button = cn(
    "grid place-items-center rounded-full transition-colors hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent",
    size === "lg" ? "size-11" : "size-8",
  );

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={button}
      >
        <MinusIcon className="size-3.5" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        aria-label={`${label}: ${value}`}
        className={cn("text-center font-medium tabular-nums", size === "lg" ? "min-w-10" : "min-w-7 text-sm")}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={button}
      >
        <PlusIcon className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
