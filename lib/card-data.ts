import type { PriceTier, Product } from "./types";

/**
 * The slice of a product a client component actually needs to render a card
 * or price a cart line. Keeping this small is what keeps `lib/catalog` — the
 * whole catalogue, in text — out of the browser bundle.
 */
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  retailPrice: number;
  priceTiers: PriceTier[];
  wholesaleMinQty: number | null;
  isNewArrival: boolean;
};

export function toCardData(product: Product): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image.src,
    imageAlt: product.image.alt,
    retailPrice: product.retailPrice,
    priceTiers: product.priceTiers,
    wholesaleMinQty: product.wholesaleMinQty,
    isNewArrival: product.isNewArrival,
  };
}
