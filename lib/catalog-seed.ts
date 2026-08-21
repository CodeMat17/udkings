/**
 * The catalogue as it was first written, and now only a seed.
 *
 * `convex/seed.ts` pushes these rows into Convex once; after that the products
 * table is the source of truth and the admin edits it there. This file is kept
 * so a fresh deployment can be populated reproducibly — it is never read at
 * request time, and nothing in `app/` imports it.
 */
import type { Category, Product } from "./types";

export const CATEGORY_SEEDS: Category[] = [
  {
    name: "Jeans",
    slug: "jeans",
    description:
      "High-waist, straight-leg, mom-fit and boyfriend cuts in raw and washed denim. Sizes 8 to 20, retail and wholesale.",
    heroImage: "/catalogue/hero-jeans.jpg",
    orderIndex: 1,
    seoTitle: "Ladies Jeans in Lagos — Retail & Wholesale",
    seoDescription:
      "High-waist, mom-fit and straight-leg ladies jeans in Lagos Island. Wholesale from 6 pieces. Pickup at Andora Plaza or delivery nationwide.",
  },
  {
    name: "Tops",
    slug: "tops",
    description:
      "Ribbed bodysuits, crop tops, corset tops and off-shoulder blouses that carry a whole outfit on their own.",
    heroImage: "/catalogue/hero-tops.jpg",
    orderIndex: 2,
    seoTitle: "Ladies Tops in Lagos — Retail & Wholesale",
    seoDescription:
      "Ribbed tops, corset tops and blouses for Lagos women. Wholesale prices for traders and boutique owners. Order on WhatsApp in ninety seconds.",
  },
  {
    name: "Gowns",
    slug: "gowns",
    description:
      "Occasion gowns, church gowns and everyday maxi dresses cut to move in Lagos heat.",
    heroImage: "/catalogue/hero-gowns.jpg",
    orderIndex: 3,
    seoTitle: "Gowns in Lagos — Occasion & Everyday",
    seoDescription:
      "Occasion and everyday gowns from UDKING'S Collections, Lagos Island. Retail and wholesale, pickup at the shop or delivery nationwide.",
  },
  {
    name: "Skirts",
    slug: "skirts",
    description:
      "Pencil, pleated, denim and satin midi skirts for work and for owambe.",
    heroImage: "/catalogue/hero-skirts.jpg",
    orderIndex: 4,
    seoTitle: "Ladies Skirts in Lagos — Retail & Wholesale",
    seoDescription:
      "Pencil, pleated and denim ladies skirts in Lagos Island. Wholesale from 6 pieces for market traders and boutiques.",
  },
  {
    name: "Bump Shorts",
    slug: "bump-shorts",
    description:
      "Bump shorts and biker shorts in thick, opaque fabric that stays put.",
    heroImage: "/catalogue/hero-bump-shorts.jpg",
    orderIndex: 5,
    seoTitle: "Bump Shorts in Lagos — Wholesale & Retail",
    seoDescription:
      "Thick, opaque bump shorts and biker shorts in Lagos. Wholesale packs available. Pickup on Breadfruit Street or delivery.",
  },
  {
    name: "Jackets",
    slug: "jackets",
    description: "Denim jackets, blazers and bomber cuts that finish a look at night.",
    heroImage: "/catalogue/hero-jackets.jpg",
    orderIndex: 6,
    seoTitle: "Ladies Jackets in Lagos — Denim & Blazers",
    seoDescription:
      "Denim jackets, blazers and bombers for Lagos women. Retail and wholesale from UDKING'S Collections, Andora Plaza.",
  },
  {
    name: "Trousers",
    slug: "trousers",
    description: "Wide-leg, palazzo and tailored trousers in fabric that holds a line.",
    heroImage: "/catalogue/hero-trousers.jpg",
    orderIndex: 7,
    seoTitle: "Ladies Trousers in Lagos — Wide-Leg & Tailored",
    seoDescription:
      "Wide-leg, palazzo and tailored ladies trousers in Lagos Island. Wholesale pricing for traders. Order on WhatsApp.",
  },
  {
    name: "Two-Piece Sets",
    slug: "two-piece-sets",
    description: "Matching sets — one decision, a whole outfit.",
    heroImage: "/catalogue/hero-two-piece-sets.jpg",
    orderIndex: 8,
    seoTitle: "Two-Piece Sets in Lagos — Matching Outfits",
    seoDescription:
      "Matching two-piece sets for Lagos women. Retail and wholesale from UDKING'S Collections on Breadfruit Street, Lagos Island.",
  },
];

type Seed = Omit<Product, "id" | "image"> & {
  /** One photograph per product — its src is derived from the slug. */
  image: { alt: string };
};

const DAY = 86_400_000;
const EPOCH = Date.UTC(2026, 6, 1);

const SEEDS: Seed[] = [
  {
    name: "Raw Indigo High-Waist Straight Jeans",
    slug: "raw-indigo-high-waist-straight-jeans",
    sku: "UDK-JNS-001",
    description:
      "Rigid raw indigo denim with a high rise that holds the waist and a straight leg that falls clean over a heel. It breaks in to your shape after a week and keeps its colour through a Lagos rainy season.",
    material: "98% cotton, 2% elastane rigid denim, 12.5oz",
    careInstructions: "Cold machine wash inside out, hang to dry, warm iron.",
    categorySlug: "jeans",
    retailPrice: 8500,
    priceTiers: [
      { minQty: 1, unitPrice: 8500 },
      { minQty: 4, unitPrice: 7900 },
      { minQty: 6, unitPrice: 7200 },
      { minQty: 12, unitPrice: 6600 },
    ],
    wholesaleMinQty: 6,
    colors: ["Raw Indigo", "Mid Blue", "Black"],
    sizes: ["8", "10", "12", "14", "16", "18"],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    orderCount: 412,
    image: { alt: "Raw indigo high-waist straight-leg jeans, front view" },
    seoTitle: "Raw Indigo High-Waist Straight Jeans",
    seoDescription:
      "Rigid raw indigo high-waist straight-leg jeans, sizes 8 to 18. Retail and wholesale from six pieces, with pickup on Lagos Island or delivery nationwide.",
    createdAt: EPOCH + 40 * DAY,
  },
  {
    name: "Washed Mom-Fit Jeans",
    slug: "washed-mom-fit-jeans",
    sku: "UDK-JNS-002",
    description:
      "A soft stone-washed mom fit with room through the thigh and a tapered ankle. The easiest jeans in the shop to sell — traders reorder these first.",
    material: "100% cotton stone-washed denim, 11oz",
    careInstructions: "Cold machine wash, tumble dry low, warm iron.",
    categorySlug: "jeans",
    retailPrice: 7800,
    priceTiers: [
      { minQty: 1, unitPrice: 7800 },
      { minQty: 6, unitPrice: 6900 },
      { minQty: 12, unitPrice: 6200 },
    ],
    wholesaleMinQty: 6,
    colors: ["Stone Wash", "Light Blue"],
    sizes: ["8", "10", "12", "14", "16", "18", "20"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    orderCount: 508,
    image: { alt: "Stone-washed mom-fit jeans, front view" },
    seoTitle: "Washed Mom-Fit Jeans",
    seoDescription:
      "Soft stone-washed mom-fit ladies jeans in sizes 8 to 20. Buy one at retail or six for the wholesale price, from our Lagos Island shop.",
    createdAt: EPOCH + 12 * DAY,
  },
  {
    name: "Ribbed Square-Neck Bodysuit",
    slug: "ribbed-square-neck-bodysuit",
    sku: "UDK-TOP-001",
    description:
      "Heavy ribbed knit with a square neck and a snap gusset, so it stays tucked all day. Thick enough to be opaque under sunlight — we checked.",
    material: "92% cotton, 8% elastane heavy rib",
    careInstructions: "Hand wash cold, reshape and dry flat. Do not bleach.",
    categorySlug: "tops",
    retailPrice: 4200,
    priceTiers: [
      { minQty: 1, unitPrice: 4200 },
      { minQty: 6, unitPrice: 3600 },
      { minQty: 12, unitPrice: 3200 },
    ],
    wholesaleMinQty: 6,
    colors: ["Black", "Chocolate", "Bone", "Hibiscus"],
    sizes: ["S", "M", "L", "XL"],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    orderCount: 631,
    image: { alt: "Ribbed square-neck bodysuit in black, front view" },
    seoTitle: "Ribbed Square-Neck Bodysuit",
    seoDescription:
      "Heavy ribbed square-neck bodysuit in four colours, sizes S to XL. Opaque, snap-fastened and priced for wholesale from six pieces in Lagos.",
    createdAt: EPOCH + 46 * DAY,
  },
  {
    name: "Corset-Seam Crop Top",
    slug: "corset-seam-crop-top",
    sku: "UDK-TOP-002",
    description:
      "Boned corset seams through a stretch woven body. Structured enough to wear alone with jeans, soft enough to sit in through a whole event.",
    material: "Stretch cotton twill with light boning",
    careInstructions: "Hand wash cold, hang to dry. Iron on reverse.",
    categorySlug: "tops",
    retailPrice: 5600,
    priceTiers: [
      { minQty: 1, unitPrice: 5600 },
      { minQty: 6, unitPrice: 4900 },
    ],
    wholesaleMinQty: 6,
    colors: ["Bone", "Black", "Olive"],
    sizes: ["S", "M", "L", "XL"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    orderCount: 188,
    image: { alt: "Corset-seam crop top in bone, front view" },
    seoTitle: "Corset-Seam Crop Top",
    seoDescription:
      "Structured corset-seam crop top in stretch cotton twill, sizes S to XL. Wears alone with jeans, and traders can buy it from six pieces.",
    createdAt: EPOCH + 50 * DAY,
  },
  {
    name: "Satin Cowl-Neck Maxi Gown",
    slug: "satin-cowl-neck-maxi-gown",
    sku: "UDK-GWN-001",
    description:
      "Weighted satin that pours rather than clings, cut on the bias with a cowl neck and a low back. It photographs the way it looks in person, which is rarer than it sounds.",
    material: "Heavy-weight polyester satin, bias cut",
    careInstructions:
      "Dry clean, or hand wash cold and hang immediately. Cool iron on reverse.",
    categorySlug: "gowns",
    retailPrice: 14500,
    priceTiers: [
      { minQty: 1, unitPrice: 14500 },
      { minQty: 4, unitPrice: 13200 },
      { minQty: 8, unitPrice: 12000 },
    ],
    wholesaleMinQty: 8,
    colors: ["Champagne", "Emerald", "Midnight"],
    sizes: ["8", "10", "12", "14", "16"],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    orderCount: 96,
    image: { alt: "Satin cowl-neck maxi gown in champagne, full length" },
    seoTitle: "Satin Cowl-Neck Maxi Gown",
    seoDescription:
      "Bias-cut satin cowl-neck maxi gown in champagne, emerald and midnight. An occasion gown you can collect on Lagos Island or have delivered.",
    createdAt: EPOCH + 52 * DAY,
  },
  {
    name: "Pleated Church Gown",
    slug: "pleated-church-gown",
    sku: "UDK-GWN-002",
    description:
      "A long-sleeve pleated gown with a lined bodice and a skirt that moves without riding up. Made for a full Sunday, not a photograph.",
    material: "Lined crepe with knife pleats",
    careInstructions: "Hand wash cold, hang to dry. Do not tumble dry.",
    categorySlug: "gowns",
    retailPrice: 12000,
    priceTiers: [
      { minQty: 1, unitPrice: 12000 },
      { minQty: 6, unitPrice: 10500 },
    ],
    wholesaleMinQty: 6,
    colors: ["Wine", "Navy", "Sage"],
    sizes: ["10", "12", "14", "16", "18"],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    orderCount: 274,
    image: { alt: "Pleated long-sleeve church gown in wine, full length" },
    seoTitle: "Pleated Church Gown",
    seoDescription:
      "Long-sleeve pleated church gown in wine, navy and sage, sizes 10 to 18. Lined bodice, full skirt, and wholesale pricing from six pieces.",
    createdAt: EPOCH + 8 * DAY,
  },
  {
    name: "Denim Pencil Midi Skirt",
    slug: "denim-pencil-midi-skirt",
    sku: "UDK-SKT-001",
    description:
      "Mid-blue denim, high waist, back slit cut long enough to walk properly. Sits at the calf on most frames.",
    material: "Non-stretch cotton denim, 10oz",
    careInstructions: "Cold machine wash inside out, hang to dry.",
    categorySlug: "skirts",
    retailPrice: 6800,
    priceTiers: [
      { minQty: 1, unitPrice: 6800 },
      { minQty: 6, unitPrice: 5900 },
      { minQty: 12, unitPrice: 5400 },
    ],
    wholesaleMinQty: 6,
    colors: ["Mid Blue", "Black"],
    sizes: ["8", "10", "12", "14", "16"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    orderCount: 152,
    image: { alt: "Mid-blue denim pencil midi skirt, front view" },
    seoTitle: "Denim Pencil Midi Skirt",
    seoDescription:
      "High-waist denim pencil midi skirt with a back walking slit, sizes 8 to 16. Retail and wholesale from our shop on Breadfruit Street.",
    createdAt: EPOCH + 20 * DAY,
  },
  {
    name: "Satin Pleated Midi Skirt",
    slug: "satin-pleated-midi-skirt",
    sku: "UDK-SKT-002",
    description:
      "Fine knife pleats in a matte satin with a fully elasticated waist, so one size covers more customers than you would expect.",
    material: "Matte polyester satin, elasticated waist",
    careInstructions: "Hand wash cold, hang to dry. Do not iron the pleats flat.",
    categorySlug: "skirts",
    retailPrice: 5900,
    priceTiers: [
      { minQty: 1, unitPrice: 5900 },
      { minQty: 6, unitPrice: 5100 },
    ],
    wholesaleMinQty: 6,
    colors: ["Champagne", "Rust", "Black"],
    sizes: ["S", "M", "L", "XL"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    orderCount: 121,
    image: { alt: "Champagne satin pleated midi skirt, front view" },
    seoTitle: "Satin Pleated Midi Skirt",
    seoDescription:
      "Matte satin knife-pleat midi skirt with an elasticated waist, sizes S to XL. Wholesale from six pieces at UDKING'S on Lagos Island.",
    createdAt: EPOCH + 48 * DAY,
  },
  {
    name: "Thick Bump Shorts",
    slug: "thick-bump-shorts",
    sku: "UDK-BMP-001",
    description:
      "Double-layer jersey that does not go sheer when you bend, with a wide waistband that stays where you put it. The wholesale line traders buy by the dozen.",
    material: "Double-layer cotton jersey with elastane",
    careInstructions: "Machine wash cold, tumble dry low.",
    categorySlug: "bump-shorts",
    retailPrice: 3200,
    priceTiers: [
      { minQty: 1, unitPrice: 3200 },
      { minQty: 6, unitPrice: 2700 },
      { minQty: 12, unitPrice: 2350 },
      { minQty: 24, unitPrice: 2100 },
    ],
    wholesaleMinQty: 6,
    colors: ["Black", "Grey", "Chocolate"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    orderCount: 742,
    image: { alt: "Thick black bump shorts, front view" },
    seoTitle: "Thick Bump Shorts",
    seoDescription:
      "Opaque double-layer bump shorts in sizes S to XXL. Four price tiers all the way to twenty-four pieces — the wholesale line traders reorder.",
    createdAt: EPOCH + 4 * DAY,
  },
  {
    name: "Oversized Denim Jacket",
    slug: "oversized-denim-jacket",
    sku: "UDK-JKT-001",
    description:
      "A boxy, dropped-shoulder denim jacket in rigid mid-blue. Wears over a gown at night and over a bodysuit in the day.",
    material: "Rigid cotton denim, 12oz, metal hardware",
    careInstructions: "Cold machine wash inside out, hang to dry.",
    categorySlug: "jackets",
    retailPrice: 11500,
    priceTiers: [
      { minQty: 1, unitPrice: 11500 },
      { minQty: 6, unitPrice: 10200 },
    ],
    wholesaleMinQty: 6,
    colors: ["Mid Blue", "Black"],
    sizes: ["S", "M", "L", "XL"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    orderCount: 89,
    image: { alt: "Oversized mid-blue denim jacket, front view" },
    seoTitle: "Oversized Denim Jacket",
    seoDescription:
      "Boxy dropped-shoulder denim jacket in rigid mid-blue and black, sizes S to XL. Wears over a gown at night, over a bodysuit in the day.",
    createdAt: EPOCH + 54 * DAY,
  },
  {
    name: "Wide-Leg Palazzo Trousers",
    slug: "wide-leg-palazzo-trousers",
    sku: "UDK-TRS-001",
    description:
      "A fluid wide leg with a flat front and a high rise. The fabric holds a line in heat instead of collapsing at midday.",
    material: "Textured crepe with a soft handle",
    careInstructions: "Hand wash cold, hang to dry. Warm iron.",
    categorySlug: "trousers",
    retailPrice: 7400,
    priceTiers: [
      { minQty: 1, unitPrice: 7400 },
      { minQty: 6, unitPrice: 6400 },
      { minQty: 12, unitPrice: 5900 },
    ],
    wholesaleMinQty: 6,
    colors: ["Black", "Camel", "Olive"],
    sizes: ["S", "M", "L", "XL"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    orderCount: 318,
    image: { alt: "Black wide-leg palazzo trousers, front view" },
    seoTitle: "Wide-Leg Palazzo Trousers",
    seoDescription:
      "High-rise wide-leg palazzo trousers in textured crepe, sizes S to XL. Fabric that holds its line in Lagos heat. Wholesale from six pieces.",
    createdAt: EPOCH + 16 * DAY,
  },
  {
    name: "Ribbed Two-Piece Lounge Set",
    slug: "ribbed-two-piece-lounge-set",
    sku: "UDK-SET-001",
    description:
      "Matching ribbed top and wide trouser. One decision, a whole outfit — and the pieces still work apart, which is why it sells twice.",
    material: "Heavy rib knit, cotton blend",
    careInstructions: "Machine wash cold inside out, dry flat.",
    categorySlug: "two-piece-sets",
    retailPrice: 9800,
    priceTiers: [
      { minQty: 1, unitPrice: 9800 },
      { minQty: 4, unitPrice: 9000 },
      { minQty: 6, unitPrice: 8400 },
      { minQty: 12, unitPrice: 7700 },
    ],
    wholesaleMinQty: 6,
    colors: ["Chocolate", "Black", "Sage"],
    sizes: ["S", "M", "L", "XL"],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    orderCount: 396,
    image: { alt: "Ribbed two-piece lounge set in chocolate, full look" },
    seoTitle: "Ribbed Two-Piece Lounge Set",
    seoDescription:
      "Matching ribbed top and wide-leg trouser set in sizes S to XL. One decision, a whole outfit, and the pieces still work apart.",
    createdAt: EPOCH + 44 * DAY,
  },
];

export const PRODUCT_SEEDS: Product[] = SEEDS.map((seed, index) => ({
  ...seed,
  id: `prd_${String(index + 1).padStart(3, "0")}`,
  image: { ...seed.image, src: `/catalogue/${seed.slug}.jpg` },
}));
