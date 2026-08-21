"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
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
 * One form for adding a piece and for editing one. Everything the storefront
 * renders is typed here, because per DECISIONS.md the colour and size lists
 * *are* the stock — there is no separate inventory to keep in step.
 *
 * Validation lives in the server action, not here: it is the only copy that
 * cannot be skipped, and one copy cannot disagree with itself.
 *
 * The web address, the SKU and the search listing are *derived*, never typed:
 * they are the fields an admin gets subtly wrong — a stray capital, a space, a
 * title that drifts from the name — and every one of them can be rebuilt from
 * the name and the description. They are shown read-only so the admin can see
 * what the shop will use before saving.
 */

const WHOLESALE_ROWS = 3;
const SEO_DESCRIPTION_LIMIT = 155;

/** The palette actually stocked. Kept in step with `lib/catalog-seed.ts`. */
const COLOURS = [
  "Raw Indigo",
  "Mid Blue",
  "Light Blue",
  "Stone Wash",
  "Black",
  "Grey",
  "Bone",
  "Chocolate",
  "Camel",
  "Champagne",
  "Rust",
  "Wine",
  "Hibiscus",
  "Emerald",
  "Sage",
  "Olive",
  "Navy",
  "Midnight",
] as const;

/** Letter sizes for tops and outerwear, dress sizes for everything cut to fit. */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "8", "10", "12", "14", "16", "18", "20"] as const;

/** "Stone Wash Straight Jean" → "stone-wash-straight-jean". Mirrors the server. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * "UDK-JNS-4F2A". The middle is the category, the tail a stable digest of the
 * name — the same piece always gets the same SKU, and two pieces in the same
 * category do not collide unless they are named identically.
 */
function makeSku(name: string, categorySlug: string): string {
  const clean = slugify(name);
  if (!clean) return "";

  const category = (categorySlug.replace(/[^a-z]/g, "").slice(0, 3) || "gen").toUpperCase();

  let hash = 0;
  for (const char of clean) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const tail = hash.toString(36).toUpperCase().slice(-4).padStart(4, "0");

  return `UDK-${category}-${tail}`;
}

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

/** A read-only mirror of something the form works out for itself. */
function DerivedRow({
  label,
  name,
  value,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  hint: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        readOnly
        tabIndex={-1}
        aria-describedby={`${name}-hint`}
        className="bg-muted/50 text-muted-foreground"
      />
      <p id={`${name}-hint`} className="text-xs text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}

/**
 * A multiple-choice list posted as one comma-separated field, which is the
 * shape `productArgs` in the server action already parses.
 */
function MultiSelect({
  label,
  name,
  options,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  hint: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${name}-trigger`}>{label}</Label>
      <input type="hidden" name={name} value={value.join(", ")} />
      <Select multiple value={value} onValueChange={onChange}>
        <SelectTrigger id={`${name}-trigger`} className="h-9 w-full">
          <SelectValue>
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.join(", ")
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
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

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? "");
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);

  const slug = useMemo(() => slugify(name), [name]);
  const sku = useMemo(() => makeSku(name, categorySlug), [name, categorySlug]);
  const seoDescription = description.trim().slice(0, SEO_DESCRIPTION_LIMIT);

  // Tier one is always the retail price; the admin edits the wholesale steps.
  const tiers = (product?.priceTiers ?? []).slice(1);

  return (
    <form action={action} className="mt-8 space-y-8">
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}

      <ImageField currentSrc={product?.image.src} currentAlt={product?.image.alt} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Row
          label="Name"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <DerivedRow
          label="Web address"
          name="slug"
          value={slug}
          placeholder="stone-wash-straight-jean"
          hint="Built from the name."
        />
        <DerivedRow
          label="SKU"
          name="sku"
          value={sku}
          placeholder="UDK-JNS-4F2A"
          hint="Built from the name and the category."
        />

        <div className="space-y-2">
          <Label htmlFor="categorySlug">Category</Label>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageAlt">Photograph description</Label>
        <Input
          id="imageAlt"
          name="imageAlt"
          required
          defaultValue={product?.image.alt}
          placeholder="Straight-leg stone wash jean on a plain background"
        />
        <p className="text-xs text-muted-foreground">
          Read aloud to shoppers using a screen reader. Describe the piece, not the photo.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Material" name="material" defaultValue={product?.material} />
        <Row label="Care" name="careInstructions" defaultValue={product?.careInstructions} />
        <MultiSelect
          label="Colours"
          name="colors"
          options={COLOURS}
          value={colors}
          onChange={setColors}
          placeholder="Choose the colours you have"
          hint="Choose every colour in the shop. Choosing one again removes it."
        />
        <MultiSelect
          label="Sizes"
          name="sizes"
          options={SIZES}
          value={sizes}
          onChange={setSizes}
          placeholder="Choose the sizes you have"
          hint="Choose every size in the shop. Choosing one again removes it."
        />
      </div>

      <fieldset className="space-y-4 rounded-xl border border-border p-4">
        <legend className="label px-1">Pricing</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Row
            label="Retail price (₦)"
            name="retailPrice"
            required
            inputMode="numeric"
            defaultValue={product?.retailPrice}
          />
          <Row
            label="Wholesale starts at (qty)"
            name="wholesaleMinQty"
            inputMode="numeric"
            hint="Blank if this piece is retail only."
            defaultValue={product?.wholesaleMinQty ?? ""}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Wholesale tiers</p>
          <p className="text-xs text-muted-foreground">
            From this quantity, each one costs this much. Leave a row blank to skip it.
          </p>
          {Array.from({ length: WHOLESALE_ROWS }, (_, index) => (
            <div key={index} className="flex gap-3">
              <Input
                name="tierMinQty"
                inputMode="numeric"
                aria-label={`Tier ${index + 1} from quantity`}
                placeholder="From qty"
                defaultValue={tiers[index]?.minQty ?? ""}
              />
              <Input
                name="tierUnitPrice"
                inputMode="numeric"
                aria-label={`Tier ${index + 1} price each`}
                placeholder="₦ each"
                defaultValue={tiers[index]?.unitPrice ?? ""}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-border p-4">
        <legend className="label px-1">Where it shows</legend>
        {[
          { name: "isFeatured", label: "Featured on the home page", value: product?.isFeatured },
          { name: "isNewArrival", label: "New arrival", value: product?.isNewArrival },
          { name: "isBestSeller", label: "Best seller", value: product?.isBestSeller },
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

      <fieldset className="space-y-5 rounded-xl border border-border p-4">
        <legend className="label px-1">Search listing</legend>
        <p className="text-xs text-muted-foreground">
          What Google shows. Taken from the name and the description above, so the two can never
          drift apart.
        </p>
        <DerivedRow
          label="Title"
          name="seoTitle"
          value={name}
          hint="The name of the piece."
          placeholder="Stone Wash Straight Jean"
        />
        <div className="space-y-2">
          <Label htmlFor="seoDescription">Description</Label>
          <Textarea
            id="seoDescription"
            name="seoDescription"
            rows={2}
            value={seoDescription}
            readOnly
            tabIndex={-1}
            aria-describedby="seoDescription-hint"
            className="bg-muted/50 text-muted-foreground"
          />
          <p id="seoDescription-hint" className="text-xs text-muted-foreground">
            The first {SEO_DESCRIPTION_LIMIT} characters of the description.
          </p>
        </div>
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
