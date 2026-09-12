import type { PriceTier, Product } from "./types";

/**
 * The slice of a product a card needs, plus what the client-side catalogue
 * browser filters and sorts on. It is rendered into static HTML, so filtering
 * the shop never needs a server round trip.
 */
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  categorySlug: string;
  sizes: string[];
  retailPrice: number;
  priceTiers: PriceTier[];
  wholesaleMinQty: number | null;
  isNewArrival: boolean;
  orderCount: number;
  createdAt: number;
};

export function toCardData(product: Product): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image.src,
    imageAlt: product.image.alt,
    categorySlug: product.categorySlug,
    sizes: product.sizes,
    retailPrice: product.retailPrice,
    priceTiers: product.priceTiers,
    wholesaleMinQty: product.wholesaleMinQty,
    isNewArrival: product.isNewArrival,
    orderCount: product.orderCount,
    createdAt: product.createdAt,
  };
}
