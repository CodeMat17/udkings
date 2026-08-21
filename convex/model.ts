import type { Doc } from "./_generated/dataModel.js";

/**
 * Convex documents carry `_id` and `_creationTime`; the app's types in
 * `lib/types.ts` do not. Every query maps through here so the shapes the
 * components already consume come back unchanged.
 */

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  material: string;
  careInstructions: string;
  categorySlug: string;
  image: { src: string; alt: string };
  retailPrice: number;
  priceTiers: { minQty: number; unitPrice: number }[];
  wholesaleMinQty: number | null;
  colors: string[];
  sizes: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  orderCount: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: number;
};

export type PublicCategory = {
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  orderIndex: number;
  seoTitle: string;
  seoDescription: string;
};

export function toProduct(doc: Doc<"products">): PublicProduct {
  return {
    id: doc.productId,
    name: doc.name,
    slug: doc.slug,
    sku: doc.sku,
    description: doc.description,
    material: doc.material,
    careInstructions: doc.careInstructions,
    categorySlug: doc.categorySlug,
    image: { src: doc.imageSrc, alt: doc.imageAlt },
    retailPrice: doc.retailPrice,
    priceTiers: doc.priceTiers,
    wholesaleMinQty: doc.wholesaleMinQty,
    colors: doc.colors,
    sizes: doc.sizes,
    isFeatured: doc.isFeatured,
    isNewArrival: doc.isNewArrival,
    isBestSeller: doc.isBestSeller,
    orderCount: doc.orderCount,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    createdAt: doc.createdAt,
  };
}

export function toCategory(doc: Doc<"categories">): PublicCategory {
  return {
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    heroImage: doc.heroImage,
    orderIndex: doc.orderIndex,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
  };
}

/** The storefront never sees an archived piece. */
export function isLive(doc: Doc<"products">): boolean {
  return doc.isArchived !== true;
}

/**
 * Strips Convex's system fields so the order matches `Order` in
 * `lib/types.ts` exactly — the shape every component and the WhatsApp
 * composer already expect.
 */
export function toOrder(doc: Doc<"orders">) {
  return {
    orderNumber: doc.orderNumber,
    status: doc.status,
    fulfilment: doc.fulfilment,
    customer: doc.customer,
    ...(doc.pickup ? { pickup: doc.pickup } : {}),
    ...(doc.delivery ? { delivery: doc.delivery } : {}),
    items: doc.items,
    subtotal: doc.subtotal,
    deliveryFee: doc.deliveryFee,
    total: doc.total,
    whatsappOpened: doc.whatsappOpened,
    createdAt: doc.createdAt,
  };
}
