export type PriceTier = {
  /** Lowest quantity this tier applies from. Tiers sort ascending; tier[0].minQty === 1. */
  minQty: number;
  /** Naira integers. No floats, anywhere. */
  unitPrice: number;
};

/** One product, one photograph. There is no second angle and no gallery. */
export type ProductImage = {
  src: string;
  alt: string;
};

export type Category = {
  name: string;
  slug: string;
  heroImage: string;
  orderIndex: number;
  seoTitle: string;
  seoDescription: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  categorySlug: string;
  image: ProductImage;
  retailPrice: number;
  priceTiers: PriceTier[];
  wholesaleMinQty: number | null;
  /** Entered by the admin at upload. Every size listed is one we have. */
  sizes: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  orderCount: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: number;
};
