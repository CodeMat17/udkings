"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { SORTS } from "@/lib/filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  /** Category pages lock the category, so the control is hidden there. */
  lockedCategory?: string;
  resultCount: number;
  /** Options come from the server, so the catalogue stays out of the bundle. */
  categories: { name: string; slug: string }[];
};

export function FilterBar({
  lockedCategory,
  resultCount,
  categories,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "" || next.get(key) === value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const active = [
    !lockedCategory && params.get("category")
      ? {
          key: "category",
          label:
            categories.find((c) => c.slug === params.get("category"))?.name ??
            params.get("category")!,
        }
      : null,
    params.get("wholesale") === "1"
      ? { key: "wholesale", label: "Wholesale lines" }
      : null,
  ].filter((x): x is { key: string; label: string } => x !== null);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Dialog.Root>
          <Dialog.Trigger className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-4 font-bold">
            <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
            Filters
            {active.length > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-accent-ink text-xs text-background">
                {active.length}
              </span>
            ) : null}
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-t-lg border-t border-border bg-background p-5 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-96 lg:rounded-none lg:border-l">
              <div className="flex items-center justify-between">
                <Dialog.Title className="display text-xl">Filters</Dialog.Title>
                <Dialog.Close
                  aria-label="Close filters"
                  className="grid size-11 place-items-center rounded-md hover:bg-accent"
                >
                  <XIcon className="size-5" aria-hidden="true" />
                </Dialog.Close>
              </div>

              {!lockedCategory ? (
                <fieldset className="mt-6">
                  <legend className="label text-muted-foreground">Category</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.slug}
                        type="button"
                        aria-pressed={params.get("category") === category.slug}
                        onClick={() => setParam("category", category.slug)}
                        className={cn(
                          "inline-flex h-11 items-center rounded-sm border px-3 font-semibold",
                          params.get("category") === category.slug
                            ? "border-accent-ink bg-accent-ink text-background"
                            : "border-border",
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <fieldset className="mt-6">
                <legend className="label text-muted-foreground">Buying mode</legend>
                <button
                  type="button"
                  aria-pressed={params.get("wholesale") === "1"}
                  onClick={() => setParam("wholesale", "1")}
                  className={cn(
                    "mt-3 inline-flex h-11 items-center rounded-sm border px-4 font-semibold",
                    params.get("wholesale") === "1"
                      ? "border-[color:var(--wholesale-ink)] text-wholesale"
                      : "border-border",
                  )}
                >
                  Wholesale lines only
                </button>
              </fieldset>

              <Dialog.Close className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary font-extrabold text-primary-foreground">
                Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
              </Dialog.Close>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>

        <label className="sr-only" htmlFor="sort">
          Sort products
        </label>
        <Select
          items={SORTS}
          value={params.get("sort") ?? "newest"}
          onValueChange={(value) =>
            value !== (params.get("sort") ?? "newest")
              ? setParam("sort", value as string)
              : undefined
          }
        >
          <SelectTrigger
            id="sort"
            className="h-11 rounded-md bg-card px-3 text-base font-bold data-[size=default]:h-11"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((sort) => (
              <SelectItem key={sort.value} value={sort.value}>
                {sort.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p aria-live="polite" className="text-sm font-semibold text-muted-foreground">
          {resultCount} {resultCount === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {active.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {active.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => setParam(chip.key, null)}
                className="inline-flex h-11 items-center gap-2 rounded-sm border border-border px-3 font-semibold"
              >
                {chip.label}
                <XIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Remove this filter</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
