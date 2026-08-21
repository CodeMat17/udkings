export type Fulfilment = "pickup" | "delivery";

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
  description: string;
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
  material: string;
  careInstructions: string;
  categorySlug: string;
  image: ProductImage;
  retailPrice: number;
  priceTiers: PriceTier[];
  wholesaleMinQty: number | null;
  /** Entered by the admin at upload. Every colour listed is one we have. */
  colors: string[];
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

/**
 * A cart line carries everything needed to price and render itself, so the
 * browser never needs the catalogue. The server refreshes these fields, and
 * reprices from scratch, whenever the cart is validated or an order is created.
 */
export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** What the piece comes in — the whole availability, kept so the cart can re-offer it. */
  colors: string[];
  sizes: string[];
  /** The one the customer chose on the product page. */
  color?: string;
  size?: string;
  quantity: number;
  retailPrice: number;
  priceTiers: PriceTier[];
  wholesaleMinQty: number | null;
};

export type OrderStatus =
  | "received"
  | "awaiting_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  productName: string;
  slug: string;
  image: string;
  /** Carried onto the order so the WhatsApp message can state them. */
  colors: string[];
  sizes: string[];
  /** The chosen one, confirmed server-side against the live lists. */
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  appliedTier: "retail" | "wholesale";
  lineTotal: number;
};

export type Order = {
  orderNumber: string;
  status: OrderStatus;
  fulfilment: Fulfilment;
  customer: { name: string; phone: string; whatsapp: string };
  pickup?: { preferredDate: string; preferredTime: string };
  delivery?: {
    state: string;
    city: string;
    address: string;
    landmark: string;
    preferredDate: string;
    preferredTime: string;
    instructions: string;
  };
  items: OrderItem[];
  subtotal: number;
  /** null means "confirmed on WhatsApp". Never invent a number. */
  deliveryFee: number | null;
  total: number;
  whatsappOpened: boolean;
  createdAt: number;
};

export type DeliveryZone = {
  state: string;
  city?: string;
  /** null = confirmed on WhatsApp. */
  fee: number | null;
  etaDays: string;
};
