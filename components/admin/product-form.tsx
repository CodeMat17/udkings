"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageField } from "@/components/admin/image-field";
import { saveProduct, type SaveProductResult } from "@/app/(admin)/actions";
import type { Category, Product } from "@/lib/types";

/**
 * One form for adding a piece and for editing one.
 *
 * The person filling this in runs a clothing shop; they do not know what a
 * slug is, and they should not have to. So the form asks only for what nobody
 * else can know — the photo, the name, the section, the price and the sizes in
 * stock — and the server works out the web address, the SKU, the photograph
 * description and the search listing from those. Everything optional folds
 * away until it is wanted, so the first screen is five things rather than
 * twenty.
 *
 * Validation lives in the server action, not here: it is the only copy that
 * cannot be skipped, and one copy cannot disagree with itself.
 */

const WHOLESALE_ROWS = 3;

/** Letter sizes for tops and outerwear, dress sizes for everything cut to fit. */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "8", "10", "12", "14", "16", "18", "20"] as const;

function Row({
  label,
  name,
  hint,
  defaultValue,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; name: string; hint?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} {...props} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/**
 * Sizes as tap-on, tap-off chips.
 *
 * A dropdown that stays open and toggles as you click is a control most people
 * have never met. Chips show every choice and its state at once, and there is
 * nothing to discover: what is dark is in stock. Posted as one comma-separated
 * field, which is the shape the server action already parses.
 */
function ChipPicker({
  legend,
  name,
  options,
  value,
  onChange,
  hint,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  hint: string;
}) {
  function toggle(option: string) {
    onChange(
      value.includes(option) ? value.filter((entry) => entry !== option) : [...value, option],
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <input type="hidden" name={name} value={value.join(", ")} />
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {options.map((option) => {
          const on = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** An optional section, shut until the admin has a reason to open it. */
function More({
  summary,
  note,
  open,
  children,
}: {
  summary: string;
  note: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="rounded-xl border border-border">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:content-none">
        {summary}
        <span className="ml-2 font-normal text-muted-foreground">{note}</span>
      </summary>
      <div className="space-y-5 border-t border-border p-4">{children}</div>
    </details>
  );
}

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const [state, action, pending] = useActionState<SaveProductResult | null, FormData>(
    saveProduct,
    null,
  );

  const router = useRouter();

  /**
   * `useActionState` hands the same result object back on every render, so the
   * toast is tied to its identity: one save, one toast, however often React
   * re-renders around it.
   */
  const announced = useRef<SaveProductResult | null>(null);
  useEffect(() => {
    if (!state || announced.current === state) return;
    announced.current = state;

    if (state.ok) {
      toast.success(state.created ? `${state.name} is in the shop` : `${state.name} saved`, {
        description: state.created
          ? "Shoppers can see it now."
          : "The shop is showing the new details.",
      });
      router.push("/admin/products");
      return;
    }

    toast.error("That could not be saved", { description: state.error });
  }, [state, router]);

  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? "");
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);

  // Tier one is always the retail price; the admin edits the bulk steps.
  const tiers = (product?.priceTiers ?? []).slice(1);

  return (
    <form action={action} className="mt-8 space-y-8">
      {product ? (
        <>
          <input type="hidden" name="productId" value={product.id} />
          {/* A published piece keeps the web address shoppers already have. */}
          <input type="hidden" name="currentSlug" value={product.slug} />
        </>
      ) : null}

      <ImageField currentSrc={product?.image.src} currentAlt={product?.image.alt} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Row
          label="Name"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="Stone Wash Straight Jean"
        />

        <div className="space-y-2">
          <Label htmlFor="categorySlug">Section of the shop</Label>
          <input type="hidden" name="categorySlug" value={categorySlug} />
          <Select
            value={categorySlug}
            onValueChange={(next) => setCategorySlug((next as string) ?? "")}
            items={categories.map((category) => ({
              value: category.slug,
              label: category.name,
            }))}
          >
            <SelectTrigger id="categorySlug" className="h-9 w-full">
              <SelectValue>
                {(value: string) =>
                  value ? (
                    categories.find((category) => category.slug === value)?.name
                  ) : (
                    <span className="text-muted-foreground">Choose one</span>
                  )
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Row
          label="Price (₦)"
          name="retailPrice"
          required
          inputMode="numeric"
          placeholder="18000"
          hint="Whole naira. No kobo, no commas."
          defaultValue={product?.retailPrice}
        />
      </div>

      <ChipPicker
        legend="Sizes in stock"
        name="sizes"
        options={SIZES}
        value={sizes}
        onChange={setSizes}
        hint="Tap every size you have. Tap again to remove it."
      />

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description}
          placeholder="A straight-leg jean in a soft stone wash, cut to sit on the waist."
        />
        <p className="text-xs text-muted-foreground">
          What you would tell a customer holding it. This is also what Google shows.
        </p>
      </div>

      <More
        summary="Bulk prices"
        note="optional — for customers buying many"
        open={tiers.length > 0}
      >
        <p className="text-xs text-muted-foreground">
          From this many pieces, each one costs this much. Leave these blank if you only sell one
          at a time. Each bulk price has to be lower than the price above.
        </p>
        {Array.from({ length: WHOLESALE_ROWS }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Input
              name="tierMinQty"
              inputMode="numeric"
              aria-label={`Bulk price ${index + 1}: from how many pieces`}
              placeholder="From 12"
              defaultValue={tiers[index]?.minQty ?? ""}
            />
            <span className="shrink-0 text-sm text-muted-foreground">pieces →</span>
            <Input
              name="tierUnitPrice"
              inputMode="numeric"
              aria-label={`Bulk price ${index + 1}: price each`}
              placeholder="₦ each"
              defaultValue={tiers[index]?.unitPrice ?? ""}
            />
          </div>
        ))}
      </More>

      <fieldset className="space-y-3 rounded-xl border border-border p-4">
        <legend className="label px-1">Show it on</legend>
        {[
          { name: "isFeatured", label: "The home page", value: product?.isFeatured },
          { name: "isNewArrival", label: "New arrivals", value: product?.isNewArrival },
          { name: "isBestSeller", label: "Best sellers", value: product?.isBestSeller },
        ].map((flag) => (
          <div key={flag.name} className="flex items-center gap-3">
            <input
              id={flag.name}
              name={flag.name}
              type="checkbox"
              defaultChecked={flag.value}
              className="size-4 accent-foreground"
            />
            <Label htmlFor={flag.name} className="font-normal">
              {flag.label}
            </Label>
          </div>
        ))}
      </fieldset>

      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
        {state && !state.ok ? state.error : ""}
      </p>

      <Button type="submit" disabled={pending} className="h-11 w-full sm:w-auto">
        {pending ? "Saving…" : product ? "Save changes" : "Add to the shop"}
      </Button>
    </form>
  );
}
