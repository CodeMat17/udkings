"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QuantityStepper } from "./quantity-stepper";
import { useCart } from "@/lib/cart-store";
import { unitPriceFor } from "@/lib/pricing";
import { formatNaira } from "@/lib/format";
import { swatchFor } from "@/lib/swatches";
import type { Product } from "@/lib/types";

/**
 * A trader counts the pieces they want of one style and one tier calculation
 * runs across the total — the same arithmetic that happens at the counter.
 * Which colours and which sizes make up that total is agreed on WhatsApp,
 * from the lists shown here; the shop confirms the mix in the reply.
 */
export function MixedPack({ product }: { product: Product }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(product.wholesaleMinQty ?? 6);

  const priced = unitPriceFor(product, Math.max(1, quantity));

  function addPack() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image.src,
      colors: product.colors,
      sizes: product.sizes,
      quantity,
      retailPrice: product.retailPrice,
      priceTiers: product.priceTiers,
      wholesaleMinQty: product.wholesaleMinQty,
    });
    toast.success(`Pack added — ${quantity} pieces of ${product.name}`, {
      description: `${formatNaira(priced.unitPrice)} each${priced.tier === "wholesale" ? " (wholesale)" : ""}. We agree the colour and size mix with you on WhatsApp.`,
    });
  }

  return (
    <div className="mt-6 rounded-md border border-border bg-card p-5">
      <div>
        <p className="label text-muted-foreground">Colours we have</p>
        <ul className="mt-3 flex flex-wrap gap-3">
          {product.colors.map((c) => (
            <li
              key={c}
              className="flex min-h-11 items-center gap-2 rounded-sm border border-border px-3 font-semibold"
            >
              <span
                aria-hidden="true"
                className="size-5 rounded-full border border-border"
                style={{ background: swatchFor(c) }}
              />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <p className="label text-muted-foreground">Sizes we have</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <li
              key={size}
              className="grid h-11 min-w-11 place-items-center rounded-sm border border-border px-3 font-bold"
            >
              {size}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <QuantityStepper
          label={`Pack quantity of ${product.name}`}
          value={quantity}
          onChange={setQuantity}
        />
        <button
          type="button"
          onClick={addPack}
          className="inline-flex h-12 items-center rounded-md bg-primary px-6 font-extrabold text-primary-foreground"
        >
          Add pack to cart
        </button>
      </div>

      <p aria-live="polite" className="mt-4 font-semibold">
        {quantity} {quantity === 1 ? "piece" : "pieces"} &middot;{" "}
        <span className="font-extrabold tabular-nums">
          {formatNaira(priced.unitPrice)}
        </span>{" "}
        each{" "}
        {priced.tier === "wholesale" ? (
          <span className="label text-wholesale">Wholesale</span>
        ) : null}
        <span className="block text-sm text-muted-foreground">
          Pack total {formatNaira(priced.lineTotal)} — tell us the colour and
          size breakdown on WhatsApp and we will confirm it.
        </span>
      </p>
    </div>
  );
}
