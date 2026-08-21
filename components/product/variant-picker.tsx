"use client";

import { swatchFor } from "@/lib/swatches";
import { cn } from "@/lib/utils";

/**
 * Colour and size, chosen. Every option listed is one the shop has — the admin
 * types in only what is in the shop as they upload the piece — so there is no
 * disabled state here: the list *is* the availability.
 *
 * Radios, not buttons, so the keyboard and screen-reader behaviour is the
 * platform's own. The colour name sits beside every swatch; a dot on its own is
 * never the signal.
 */
export function ColorPicker({
  colors,
  value,
  onChange,
  name,
}: {
  colors: string[];
  value: string | undefined;
  onChange: (color: string) => void;
  name: string;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="label text-muted-foreground">
        Colour{value ? <span className="ml-2 text-foreground">{value}</span> : null}
      </legend>
      <div className="mt-3 flex flex-wrap gap-3">
        {colors.map((c) => (
          <label
            key={c}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border px-3 font-semibold",
              "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              value === c
                ? "border-foreground bg-accent"
                : "border-border hover:bg-accent",
            )}
          >
            <input
              type="radio"
              name={name}
              value={c}
              checked={value === c}
              onChange={() => onChange(c)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className="size-5 rounded-full border border-border"
              style={{ background: swatchFor(c) }}
            />
            {c}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SizePicker({
  sizes,
  value,
  onChange,
  name,
}: {
  sizes: string[];
  value: string | undefined;
  onChange: (size: string) => void;
  name: string;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="label text-muted-foreground">
        Size{value ? <span className="ml-2 text-foreground">{value}</span> : null}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((s) => (
          <label
            key={s}
            className={cn(
              "grid h-11 min-w-11 cursor-pointer place-items-center rounded-sm border px-3 font-bold",
              "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              value === s
                ? "border-foreground bg-accent"
                : "border-border hover:bg-accent",
            )}
          >
            <input
              type="radio"
              name={name}
              value={s}
              checked={value === s}
              onChange={() => onChange(s)}
              className="sr-only"
            />
            {s}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
