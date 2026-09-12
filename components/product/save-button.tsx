"use client";

import { HeartIcon } from "lucide-react";
import { toast } from "sonner";
import { toggleSaved, useSaved } from "@/lib/bag";
import type { ProductCardData } from "@/lib/card-data";
import { cn } from "@/lib/utils";

export function SaveButton({
  product,
  className,
  withLabel = false,
}: {
  product: ProductCardData;
  className?: string;
  withLabel?: boolean;
}) {
  const { has } = useSaved();
  const active = has(product.slug);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={withLabel ? undefined : active ? `Remove ${product.name} from saved` : `Save ${product.name}`}
      onClick={(event) => {
        // Cards wrap this in a link; saving must not navigate.
        event.preventDefault();
        event.stopPropagation();
        toast(toggleSaved(product) ? "Saved for later" : "Removed from saved");
      }}
      className={className}
    >
      <HeartIcon
        className={cn("size-[18px] transition-colors", active && "fill-primary text-primary")}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {withLabel ? <span>{active ? "Saved" : "Save for later"}</span> : null}
    </button>
  );
}
