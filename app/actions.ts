"use server";

import { getProducts, zoneFor } from "@/lib/catalog";
import { toCardData, type ProductCardData } from "@/lib/card-data";
import { createOrderRecord, findOrder, markWhatsappOpened } from "@/lib/order-store";
import type { CartLine, Fulfilment, Order } from "@/lib/types";

export type CheckoutPayload = {
  fulfilment: Fulfilment;
  customer: { name: string; phone: string; whatsapp: string };
  pickup?: { preferredDate: string; preferredTime: string };
  delivery?: {
    zoneLabel: string;
    address: string;
    landmark: string;
    preferredDate: string;
    preferredTime: string;
    instructions: string;
  };
  lines: CartLine[];
};

export type CheckoutResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

/**
 * Pricing, order numbering and the insert all happen inside one Convex
 * mutation, so the number cannot be issued twice and the totals cannot
 * disagree with the catalogue. Client-submitted prices are not passed on at
 * all — only product ids and quantities cross this boundary.
 */
export async function createOrder(
  payload: CheckoutPayload,
): Promise<CheckoutResult> {
  if (payload.lines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (!payload.customer.name.trim() || !payload.customer.phone.trim()) {
    return { ok: false, error: "We need a name and a phone number to reach you on." };
  }

  const zone = zoneFor(payload.delivery?.zoneLabel ?? "");

  return createOrderRecord({
    fulfilment: payload.fulfilment,
    customer: {
      name: payload.customer.name.trim(),
      phone: payload.customer.phone.trim(),
      whatsapp: (payload.customer.whatsapp || payload.customer.phone).trim(),
    },
    ...(payload.fulfilment === "pickup" && payload.pickup
      ? { pickup: payload.pickup }
      : {}),
    ...(payload.fulfilment === "delivery" && payload.delivery
      ? {
          delivery: {
            state: zone?.state ?? payload.delivery.zoneLabel,
            city: zone?.city ?? "",
            address: payload.delivery.address,
            landmark: payload.delivery.landmark,
            preferredDate: payload.delivery.preferredDate,
            preferredTime: payload.delivery.preferredTime,
            instructions: payload.delivery.instructions,
          },
        }
      : {}),
    // null means "the shop decides it". The zone fees are published as a guide
    // — distance, weight and the day all move the real number — so no delivery
    // order carries a fee the customer was never quoted by a person.
    deliveryFee: payload.fulfilment === "delivery" ? null : 0,
    lines: payload.lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      // The choice, not the price. Convex checks it against the live lists.
      ...(line.color ? { color: line.color } : {}),
      ...(line.size ? { size: line.size } : {}),
    })),
  });
}

export async function confirmHandoff(orderNumber: string): Promise<void> {
  await markWhatsappOpened(orderNumber);
}

export type TrackResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

/**
 * Order number plus phone — both required. This is the only access control
 * on the record, so match the phone loosely on formatting but strictly on digits.
 */
export async function trackOrder(
  orderNumber: string,
  phone: string,
): Promise<TrackResult> {
  const order = await findOrder(orderNumber);
  const digits = (value: string) => value.replace(/\D/g, "").replace(/^234/, "0");

  if (!order || digits(order.customer.phone) !== digits(phone)) {
    return {
      ok: false,
      error:
        "We could not find that order. Check the order number and the phone number you ordered with.",
    };
  }
  return { ok: true, order };
}

/* ---------------------------------------------------------------------------
   Catalogue lookups for client components.

   These exist so that `lib/catalog` — the whole catalogue, as text — never
   ships to the browser. Search, recently-viewed and the wishlist all read
   through here instead of importing the data directly.
--------------------------------------------------------------------------- */

export async function searchProducts(query: string): Promise<ProductCardData[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const products = await getProducts();
  return products.filter((p) =>
    [p.name, p.sku, p.categorySlug, ...p.colors, ...p.sizes]
      .join(" ")
      .toLowerCase()
      .includes(q),
  )
    .slice(0, 8)
    .map(toCardData);
}

export async function productsBySlugs(slugs: string[]): Promise<ProductCardData[]> {
  const products = await getProducts();
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map(toCardData);
}

/**
 * Cart validation, run when the cart is shown. Products get deleted, prices
 * change and the colours and sizes a piece comes in change while a cart sits in
 * localStorage — the browser cannot know any of that, so the server tells it.
 */
export type CartValidation = {
  lines: CartLine[];
  notices: string[];
};

export async function validateCart(lines: CartLine[]): Promise<CartValidation> {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const kept: CartLine[] = [];
  const notices: string[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      notices.push(`${line.name} is no longer in the catalogue. Removed from your cart.`);
      continue;
    }
    // A colour or size can stop being stocked while the cart sits in
    // localStorage. Drop the stale choice and say so, rather than ordering it.
    let color = line.color;
    let size = line.size;
    if (color && !product.colors.includes(color)) {
      notices.push(`${product.name} is no longer available in ${color}. Choose another colour.`);
      color = undefined;
    }
    if (size && !product.sizes.includes(size)) {
      notices.push(`${product.name} is no longer available in size ${size}. Choose another size.`);
      size = undefined;
    }

    kept.push({
      ...line,
      ...(color ? { color } : { color: undefined }),
      ...(size ? { size } : { size: undefined }),
      name: product.name,
      image: product.image.src,
      colors: product.colors,
      sizes: product.sizes,
      retailPrice: product.retailPrice,
      priceTiers: product.priceTiers,
      wholesaleMinQty: product.wholesaleMinQty,
      quantity: Math.max(1, Math.floor(line.quantity)),
    });
  }

  return { lines: kept, notices };
}
