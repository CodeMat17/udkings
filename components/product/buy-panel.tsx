"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageCircleIcon,
  Share2Icon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  StoreIcon,
  TruckIcon,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { QuantityStepper } from "./quantity-stepper";
import { SaveButton } from "./save-button";
import { SizePicker } from "./variant-picker";
import { addToBag, openBag, rememberViewed, type BagLine } from "@/lib/bag";
import { toCardData } from "@/lib/card-data";
import { unitPriceFor } from "@/lib/pricing";
import { formatNaira } from "@/lib/format";
import { composeBagMessage, composeProductEnquiry } from "@/lib/whatsapp";
import { BUSINESS, SITE_URL, waLink } from "@/lib/business";
import type { Product } from "@/lib/types";

export function BuyPanel({ product }: { product: Product }) {
  const card = useMemo(() => toCardData(product), [product]);
  const [quantity, setQuantity] = useState(1);
  // One option is not a choice — pre-select it rather than asking for it.
  const [size, setSize] = useState<string | undefined>(
    product.sizes.length === 1 ? product.sizes[0] : undefined,
  );
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    rememberViewed(card);
  }, [card]);

  const price = unitPriceFor(product, quantity);
  const needsSize = product.sizes.length > 0 && !size;
  const url = `${SITE_URL}/product/${product.slug}`;

  /** The line as chosen, or null (and a prompt) while a size is missing. */
  function chosenLine(): BagLine | null {
    if (needsSize) {
      setMissing(true);
      document.getElementById("size-picker")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return null;
    }
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image.src,
      ...(size ? { size } : {}),
      quantity,
      retailPrice: product.retailPrice,
      priceTiers: product.priceTiers,
      wholesaleMinQty: product.wholesaleMinQty,
    };
  }

  function onAdd() {
    const line = chosenLine();
    if (!line) return;
    addToBag(line);
    openBag();
  }

  function onOrderNow() {
    const line = chosenLine();
    if (!line) return;
    window.open(waLink(composeBagMessage([line])), "_blank", "noopener,noreferrer");
  }

  async function onShare() {
    const text = `${product.name} — ${formatNaira(product.retailPrice)} at ${BUSINESS.name}`;
    if ("share" in navigator) {
      try {
        await navigator.share({ title: product.name, text, url });
      } catch {
        /* The customer dismissed the sheet. */
      }
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener");
  }

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-2xl font-medium tabular-nums">{formatNaira(price.unitPrice)}</p>
        <p className="text-sm text-muted-foreground">per piece</p>
      </div>

      <div className="hairline my-7" />

      {product.sizes.length > 0 ? (
        <div id="size-picker" className="mb-6 scroll-mt-32">
          <SizePicker
            sizes={product.sizes}
            value={size}
            onChange={(next) => {
              setSize(next);
              setMissing(false);
            }}
            name="size"
          />
          {missing && needsSize ? (
            <p role="alert" className="mt-2 text-sm font-medium text-destructive">
              Please choose a size.
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="label text-muted-foreground">Quantity</p>
      <div className="mt-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </div>

      <div className="mt-7 grid gap-3">
        <button type="button" onClick={onAdd} className="btn btn-primary h-14 w-full">
          <ShoppingBagIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
          Add to bag
          <span className="opacity-60">·</span>
          <span className="tabular-nums">{formatNaira(price.lineTotal)}</span>
        </button>
        <button type="button" onClick={onOrderNow} className="btn btn-whatsapp h-14 w-full">
          <WhatsAppIcon className="size-5" aria-hidden="true" />
          Order this on WhatsApp
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <SaveButton
          product={card}
          withLabel
          className="inline-flex items-center gap-2 hover:text-muted-foreground"
        />
        <button type="button" onClick={onShare} className="inline-flex items-center gap-2 hover:text-muted-foreground">
          <Share2Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
          Share
        </button>
        <a
          href={waLink(composeProductEnquiry({ name: product.name, url, size }))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:text-muted-foreground"
        >
          <MessageCircleIcon className="size-4" strokeWidth={1.5} aria-hidden="true" />
          Ask a question
        </a>
      </div>

      <ul className="mt-8 grid gap-3.5 rounded-lg bg-secondary/70 p-5 text-sm">
        <li className="flex gap-3">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          Nothing is paid here — we confirm availability and price on WhatsApp first.
        </li>
        <li className="flex gap-3">
          <TruckIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          Delivery anywhere in Nigeria, with the fee agreed before you pay.
        </li>
        <li className="flex gap-3">
          <StoreIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          Free pickup at {BUSINESS.address.street}.
        </li>
      </ul>
    </div>
  );
}
