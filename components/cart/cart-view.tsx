"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { swatchFor } from "@/lib/swatches";

import { lineKey, reTieringNotice, useCart, useCartValidation } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

export function CartView({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const { priced, subtotal, setQuantity, setChoice, remove, ready, count } = useCart();
  const validated = useCartValidation();

  if (!ready || !validated) {
    // Skeleton matches the final height so streaming in the cart shifts nothing.
    return (
      <div className="shell py-10">
        <h1 className="display text-[length:var(--text-display-l)]">Your cart</h1>
        <div className="mt-8 h-48 animate-pulse rounded-md bg-secondary" />
      </div>
    );
  }

  if (priced.length === 0) {
    return (
      <div className="shell py-10">
        <h1 className="display text-[length:var(--text-display-l)]">Your cart</h1>
        <p className="mt-4 max-w-[52ch] text-muted-foreground">
          Nothing in here yet. Start from a rail — everything in the shop is
          priced for one piece and for a dozen.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex h-11 items-center rounded-sm border border-border px-4 font-semibold hover:bg-accent"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="shell py-10">
      <h1 className="display text-[length:var(--text-display-l)]">Your cart</h1>
      <p aria-live="polite" className="mt-2 font-semibold text-muted-foreground">
        {count} {count === 1 ? "piece" : "pieces"}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-6">
          {priced.map((line) => {
            const notice = reTieringNotice(line);
            const key = lineKey(line);
            return (
              <li
                key={key}
                className="flex gap-4 border-b border-border pb-6"
              >
                <Link href={`/product/${line.slug}`} className="shrink-0">
                  <Image
                    src={line.image}
                    alt=""
                    width={96}
                    height={120}
                    sizes="96px"
                    className="h-30 w-24 bg-white object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/product/${line.slug}`} className="font-bold hover:underline">
                    {line.name}
                  </Link>
                  {/* Changing a choice here is the same act as choosing it on
                      the product page — no need to go back for it. */}
                  <div className="mt-2 flex flex-wrap gap-3">
                    {line.colors.length > 0 ? (
                      <div>
                        <label
                          htmlFor={`${key}-colour`}
                          className="label block text-muted-foreground"
                        >
                          Colour
                        </label>
                        <Select
                          items={line.colors.map((c) => ({ label: c, value: c }))}
                          value={line.color ?? null}
                          onValueChange={(value) =>
                            setChoice(key, { color: (value as string | null) ?? undefined })
                          }
                        >
                          <SelectTrigger
                            id={`${key}-colour`}
                            aria-label={`Colour for ${line.name}`}
                            className="mt-1 h-11 rounded-sm bg-card px-3 font-semibold data-[size=default]:h-11"
                          >
                            <SelectValue placeholder="Choose a colour" />
                          </SelectTrigger>
                          <SelectContent className="p-1">
                            {line.colors.map((c) => (
                              <SelectItem key={c} value={c} className="py-2">
                                <span
                                  aria-hidden="true"
                                  className="size-4 shrink-0 rounded-full border border-border"
                                  style={{ background: swatchFor(c) }}
                                />
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                    {line.sizes.length > 0 ? (
                      <div>
                        <label
                          htmlFor={`${key}-size`}
                          className="label block text-muted-foreground"
                        >
                          Size
                        </label>
                        <Select
                          items={line.sizes.map((s) => ({ label: s, value: s }))}
                          value={line.size ?? null}
                          onValueChange={(value) =>
                            setChoice(key, { size: (value as string | null) ?? undefined })
                          }
                        >
                          <SelectTrigger
                            id={`${key}-size`}
                            aria-label={`Size for ${line.name}`}
                            className="mt-1 h-11 rounded-sm bg-card px-3 font-semibold data-[size=default]:h-11"
                          >
                            <SelectValue placeholder="Choose a size" />
                          </SelectTrigger>
                          <SelectContent className="p-1">
                            {line.sizes.map((s) => (
                              <SelectItem key={s} value={s} className="py-2">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                  {!line.color || !line.size ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pick a colour and a size, or we settle them on WhatsApp.
                    </p>
                  ) : null}

                  <p className="mt-2 font-extrabold tabular-nums">
                    {formatNaira(line.unitPrice)} each
                    {line.appliedTier === "wholesale" ? (
                      <span className="label ml-2 text-wholesale">Wholesale</span>
                    ) : null}
                  </p>

                  {notice ? (
                    <p aria-live="polite" className="mt-1 text-sm text-muted-foreground">
                      {notice}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <QuantityStepper
                      size="sm"
                      value={line.quantity}
                      label={`Quantity of ${line.name}`}
                      onChange={(next) =>
                        setQuantity(key, next)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        remove(key);
                        toast(`Removed ${line.name} from your cart`);
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-md px-3 font-semibold text-muted-foreground hover:bg-accent"
                    >
                      <Trash2Icon className="size-4" aria-hidden="true" />
                      Remove
                      <span className="sr-only">
                        {line.name}
                      </span>
                    </button>
                    <p className="ml-auto font-extrabold tabular-nums">
                      {formatNaira(line.lineTotal)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-md border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="display text-2xl">Summary</h2>
          <dl className="mt-5 space-y-3">
            <div className="flex justify-between gap-4">
              <dt>Subtotal</dt>
              <dd className="font-extrabold tabular-nums">{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Delivery</dt>
              <dd className="text-right text-sm text-muted-foreground">
                Chosen at checkout
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3 text-lg">
              <dt className="font-extrabold">Total</dt>
              <dd className="font-extrabold tabular-nums">{formatNaira(subtotal)}</dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary font-extrabold text-primary-foreground"
          >
            Checkout
          </Link>
          <Link
            href="/shop"
            className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md border border-border font-bold"
          >
            Keep shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
