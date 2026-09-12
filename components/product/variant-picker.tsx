"use client";

import { cn } from "@/lib/utils";

/**
 * Size, chosen. Every option listed is one the shop has, so there is no
 * disabled state: the list *is* the availability. Radios, so keyboard and
 * screen-reader behaviour is the platform's own.
 */
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
    <fieldset>
      <legend className="label text-muted-foreground">
        Size{value ? <span className="ml-2 text-foreground">{value}</span> : null}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((size) => (
          <label
            key={size}
            className={cn(
              "grid h-11 min-w-12 cursor-pointer place-items-center rounded-full border px-4 text-sm font-medium transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
              value === size
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:border-foreground",
            )}
          >
            <input
              type="radio"
              name={name}
              value={size}
              checked={value === size}
              onChange={() => onChange(size)}
              className="sr-only"
            />
            {size}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
