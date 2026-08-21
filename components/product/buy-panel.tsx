"use client";

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { HeartIcon, Share2Icon, ShoppingBagIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { toast } from "sonner";
import { QuantityStepper } from "./quantity-stepper";
import { TierMeter } from "./tier-meter";
import { StickyOrderBar } from "./sticky-order-bar";
import { useCart } from "@/lib/cart-store";
import { rememberViewed, useWishlist } from "@/lib/wishlist-store";
import { unitPriceFor } from "@/lib/pricing";
import { formatNaira } from "@/lib/format";
import { ColorPicker, SizePicker } from "./variant-picker";
import { composeProductEnquiry } from "@/lib/whatsapp";
import { BUSINESS, SITE_URL, waLink } from "@/lib/business";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function BuyPanel({ product }: { product: Product }) {
  const reduced = useReducedMotion();
  const { add } = useCart();
  const wishlist = useWishlist();

  const [quantity, setQuantity] = useState(1);
  // One option is not a choice — pre-select it rather than asking for it.
  const [color, setColor] = useState<string | undefined>(
    product.colors.length === 1 ? product.colors[0] : undefined,
  );
  const [size, setSize] = useState<string | undefined>(
    product.sizes.length === 1 ? product.sizes[0] : undefined,
  );
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    rememberViewed(product.slug);
  }, [product.slug]);

  // Everything listed is in the shop: the admin types in only what is there as
  // they upload the piece, so the lists are the availability and every option
  // is selectable.
  const priced = unitPriceFor(product, quantity);
  const needsColor = product.colors.length > 0 && !color;
  const needsSize = product.sizes.length > 0 && !size;

  const enquiryHref = waLink(
    composeProductEnquiry({
      name: product.name,
      sku: product.sku,
      url: `${SITE_URL}/product/${product.slug}`,
      colors: product.colors,
      sizes: product.sizes,
      color,
      size,
      quantity,
    }),
  );

  function onAdd() {
    if (needsColor || needsSize) {
      setMissing(true);
      toast.error(
        needsColor && needsSize
          ? "Choose a colour and a size first."
          : needsColor
            ? "Choose a colour first."
            : "Choose a size first.",
      );
      document
        .getElementById(needsColor ? "buy-colour" : "buy-size")
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setMissing(false);
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image.src,
      colors: product.colors,
      sizes: product.sizes,
      ...(color ? { color } : {}),
      ...(size ? { size } : {}),
      quantity,
      retailPrice: product.retailPrice,
      priceTiers: product.priceTiers,
      wholesaleMinQty: product.wholesaleMinQty,
    });
    const chosen = [color, size].filter(Boolean).join(" · ");
    toast.success(`Added to cart — ${product.name}`, {
      description: `${chosen ? `${chosen} — ` : ""}${quantity} ${quantity === 1 ? "piece" : "pieces"} at ${formatNaira(priced.unitPrice)} each${priced.tier === "wholesale" ? " (wholesale)" : ""}.`,
    });
  }

  async function onShare() {
    const url = `${SITE_URL}/product/${product.slug}`;
    const text = `${product.name} — ${formatNaira(product.retailPrice)} at ${BUSINESS.name}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: product.name, text, url });
        return;
      } catch {
        /* The customer dismissed the sheet. Nothing to report. */
        return;
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      "_blank",
      "noopener",
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <m.p
          key={priced.unitPrice}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.base, ease: ease.out }}
          className="display text-4xl tabular-nums"
        >
          {formatNaira(priced.unitPrice)}
        </m.p>
        <p className="label text-muted-foreground">
          per piece &middot; {priced.tier}
        </p>
      </div>

      {product.wholesaleMinQty !== null ? (
        <p className="label mt-2 text-wholesale">
          Wholesale from {product.wholesaleMinQty} pieces
        </p>
      ) : null}

      {/* Chosen here, and carried through the cart onto the order and the
          WhatsApp message. Everything listed is in the shop. */}
      {product.colors.length > 0 ? (
        <div id="buy-colour">
          <ColorPicker
            colors={product.colors}
            value={color}
            onChange={(next) => {
              setColor(next);
              setMissing(false);
            }}
            name="buy-colour-choice"
          />
          {missing && needsColor ? (
            <p role="alert" className="mt-2 text-sm font-bold text-destructive">
              Choose a colour.
            </p>
          ) : null}
        </div>
      ) : null}

      {product.sizes.length > 0 ? (
        <div id="buy-size">
          <SizePicker
            sizes={product.sizes}
            value={size}
            onChange={(next) => {
              setSize(next);
              setMissing(false);
            }}
            name="buy-size-choice"
          />
          {missing && needsSize ? (
            <p role="alert" className="mt-2 text-sm font-bold text-destructive">
              Choose a size.
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 text-sm font-semibold text-muted-foreground">
        Everything listed here is in the shop. Your choice travels with the order
        and we confirm it on WhatsApp.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 font-extrabold text-primary-foreground sm:w-auto sm:min-w-48"
        >
          <ShoppingBagIcon className="size-5" aria-hidden="true" />
          Add to cart
        </button>
      </div>

      <TierMeter product={product} quantity={quantity} />

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            const added = wishlist.toggle(product.slug);
            toast(added ? "Saved to your wishlist" : "Removed from your wishlist");
          }}
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 font-semibold"
        >
          <HeartIcon
            className={cn("size-4", wishlist.has(product.slug) && "fill-current text-accent-ink")}
            aria-hidden="true"
          />
          {wishlist.has(product.slug) ? "Saved" : "Save for later"}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 font-semibold"
        >
          <Share2Icon className="size-4" aria-hidden="true" />
          Share
        </button>
        <a
          href={enquiryHref}
          target="_blank"
          rel="noopener"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 font-semibold"
        >
          <WhatsAppIcon className="size-4 text-stock" aria-hidden="true" />
          Ask about this piece
        </a>
      </div>

      <StickyOrderBar product={product} onAdd={onAdd} />
    </div>
  );
}
