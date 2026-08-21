# UDKING'S Collections — Build Specification

> **For:** Claude Code
> **Deliverable:** A cinematic, mobile-first fashion catalogue and WhatsApp ordering platform.
> **Non-negotiable:** Lighthouse 100 / 100 / 100 / 100 (Performance, Accessibility, Best Practices, SEO) on mobile emulation, on every public route.

---

## 0. How to use this document

Build in the phase order given in §16. Do not start a phase until the previous phase's acceptance criteria pass. Every phase ends with a Lighthouse run — regressions are fixed before moving on, never "at the end". Where this document specifies a token, a value, a file name or a rule, follow it exactly; where it leaves a decision open, choose and record the choice in `/docs/DECISIONS.md`.

Read §3 (design system) and §14 (Lighthouse contract) before writing any component. Most of the ways this project can fail are in those two sections.

---

## 1. The business

| | |
|---|---|
| **Name** | UDKING'S Collections |
| **Trade** | Ladies' fashion — jeans, tops, gowns, skirts, bump shorts, jackets, trousers, two-piece sets |
| **Model** | Retail **and** wholesale, from the same catalogue |
| **Address** | Shop BF04, Andora Plaza, by St. Paul Anglican Church, Breadfruit Street, Lagos Island, Lagos |
| **Orders** | WhatsApp — **+234 806 656 8595** (`2348066568595`) |
| **Fulfilment** | Pickup at the shop, or delivery (Lagos + nationwide) |
| **Audience** | Nigerian women buying for themselves (retail) and market traders / boutique owners buying stock (wholesale). Overwhelmingly mobile, mostly arriving from Instagram, TikTok and WhatsApp status. Data is expensive and connections are uneven. |

**The single job of this site:** let a woman on a 3G phone find something she likes, see the colours and sizes we actually have and the real price at her quantity, and land in WhatsApp with a complete, structured order — or with her question about the piece — in under ninety seconds.

Everything in this spec serves that sentence. Anything that doesn't, cut.

---

## 2. Architecture

### 2.1 Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)** | Server Components by default. `proxy.ts` — **not** `middleware.ts` — for headers, CSP and admin route protection. |
| Language | **TypeScript**, `strict: true` | `noUncheckedIndexedAccess: true`. No `any`, no non-null `!` in app code. |
| Styling | **Tailwind CSS** | Tokens as CSS custom properties (§3.2). No arbitrary hex values in components. |
| Components | **shadcn/ui** | Radix primitives give us most of the a11y for dialogs, sheets, selects, tabs. Restyle to the tokens; never ship the default look. |
| Motion | **Framer Motion** via `LazyMotion` + `m.*` | See §3.6 for the mandatory import pattern — this is a performance-budget item. |
| Theming | **next-themes** | `class` strategy, `attribute="class"`, `disableTransitionOnChange`. |
| Database | **Convex** | Single source of truth for products, inventory, orders, promos, reviews. |
| Auth | **Clerk** | Admin/staff only. No customer accounts in v1. |
| Images | **Cloudinary** | Custom Next.js image loader. Transformations in the URL, `f_auto,q_auto:good`. |
| Fonts | **next/font/google** | Nunito + Fraunces, self-hosted, subset `latin`. |
| Hosting | Vercel (assumed) | Node runtime for admin routes, Edge for `proxy.ts`. |

### 2.2 The one architectural rule

**WhatsApp is the conversation. Convex is the record.**

```
Customer → Website → Cart → Checkout
                              ↓
                    Convex creates the Order  ← the durable record lives here
                              ↓
                    Order number generated (UDK-YYYYMMDD-NNN)
                              ↓
                    Structured message composed
                              ↓
                    wa.me deep link → 2348066568595
```

The order exists, with its number and status, whether or not the customer ever presses send in WhatsApp. Admin sees abandoned handoffs and can chase them. This is what makes the business look like a business at 400 orders a month.

### 2.3 Rendering strategy per route

| Route | Strategy | Why |
|---|---|---|
| `/` | Static + ISR (`revalidate: 300`) | LCP must be instant. Featured content changes slowly. |
| `/shop`, `/category/[slug]` | Static shell + streamed product grid | Filters are URL search params, handled server-side. |
| `/product/[slug]` | `generateStaticParams` + ISR (`revalidate: 60`) | The most-shared, most-crawled route. Must be static HTML. |
| `/cart`, `/checkout` | Client | Cart lives in `localStorage`, hydrated after paint. |
| `/track` | Server action on submit | No client bundle needed for the form. |
| `/admin/**` | Dynamic, Node runtime, `noindex` | Behind Clerk via `proxy.ts`. Excluded from all Lighthouse targets. |

**Price is never baked into static HTML as truth.** Static pages render the *catalogue* (name, image, copy, tier structure) and every order is repriced on the server before it becomes an order. Availability is the colour and size lists themselves — the admin edits them the moment something goes — so there is no stock number to stream and no page that can claim "in stock" from a five-minute-old cache.

---

## 3. Design system — "Breadfruit"

### 3.1 The direction

Not a template store. Not a cream-and-serif editorial blog. The reference is a **fashion film**: full-bleed imagery, deep indigo shadow, one loud pink that behaves like a spotlight, and type that alternates between a soft-serif display voice and a warm, round UI voice.

The palette is pulled out of the product itself — raw indigo denim is the anchor of this catalogue, so indigo is the dark surface, not a generic near-black. The accent is hibiscus, the pink that reads as *Lagos ladies' fashion* rather than as a startup gradient. Brass is reserved, always and only, for wholesale — so a trader learns to read the colour as "this is your price."

**Signature element — the Tier Meter.** On every product page, a horizontal meter under the quantity stepper shows where the customer sits in the wholesale ladder and fills toward the next tier:

```
₦8,500 each                                    ₦7,200 each
├───────────●─────────────────────────────────────────┤
1 pc                4 pcs                          6 pcs
                    ▲ you
        Add 2 more to unlock the wholesale price
```

It fills with a spring as the stepper increments, the unit price crossfades and counts down, and the brass rail lights up at the moment the tier unlocks. This is the one place the design is allowed to show off, because it encodes the thing that actually makes this business different. Everything else stays disciplined.

### 3.2 Colour tokens

Defined once in `app/globals.css` as CSS custom properties on `:root` and `.dark`. Tailwind reads them via `@theme`. **No component may use a raw hex value.**

```css
:root {
  /* Surfaces */
  --oyster:        #F1F0EC;  /* page background, light */
  --oyster-raised: #FFFFFF;  /* cards, sheets, light */
  --oyster-sunken: #E4E2DC;  /* wells, skeletons, light */

  /* Ink */
  --indigo-900:    #10132B;  /* page background, dark */
  --indigo-800:    #191D3D;  /* cards, sheets, dark */
  --indigo-700:    #262B52;  /* borders, dark */
  --indigo-ink:    #14162E;  /* body text on light */

  /* Accent — hibiscus */
  --hibiscus:      #C2185B;  /* accent on LIGHT surfaces */
  --hibiscus-lift: #FF5C8A;  /* accent on DARK surfaces */

  /* Wholesale — brass. Reserved. */
  --brass:         #8A6A12;  /* brass text on LIGHT */
  --brass-lift:    #E8C36A;  /* brass text/rail on DARK */

  /* Neutral text */
  --muted-light:   #55525C;  /* secondary text on oyster */
  --muted-dark:    #A9AEC9;  /* secondary text on indigo */

  /* Status */
  --in-stock:      #1B6B4A;
  --in-stock-lift: #5BD6A0;
  --gone:          #9A3226;
  --gone-lift:     #FF8B7A;
}
```

**Contrast rules — these are Lighthouse-blocking, not suggestions:**

- `--hibiscus` on `--oyster` = 6.1:1 ✓ body text OK. `--hibiscus` on `--indigo-900` = 3.4:1 ✗ **never** — use `--hibiscus-lift` (8.9:1) on dark.
- `--brass` on light = 5.2:1 ✓. `--brass-lift` on dark = 9.1:1 ✓. The reverse pairings both fail — do not use them.
- Every token pair used together must be verified with a contrast checker before merge. Add the checked pairs to `/docs/CONTRAST.md`.
- **Colour is never the only signal.** Every swatch is shown with its colour name in text beside it, never as a dot on its own. Wholesale prices get the word "wholesale", not just brass.

### 3.3 Typography

Two families only. This is a performance decision as much as a design one — every extra family is another render-blocking asset on a 3G phone.

```ts
// app/fonts.ts
import { Nunito, Fraunces } from "next/font/google";

export const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"],
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  weight: ["600", "700"],
});
```

| Role | Face | Treatment |
|---|---|---|
| Display (hero, section openers, product name on PDP) | **Fraunces** 700, `SOFT` high, `WONK` on, optical size large | Tight leading (0.95–1.05), `-0.02em` tracking. Used sparingly — at most two per screen. |
| Body, UI, buttons, forms | **Nunito** 400 / 600 / 700 | 16px minimum, 1.6 leading. |
| Eyebrows, labels, prices, SKU, tier meter | **Nunito 800**, uppercase, `0.12em` tracking, 12–13px | Never Fraunces. The utility voice is flat and wide. |

Type scale (mobile → desktop, fluid via `clamp()`):

```
display-xl  clamp(2.75rem, 9vw, 5.5rem)     Fraunces 700
display-l   clamp(2rem, 6vw, 3.5rem)        Fraunces 700
display-m   clamp(1.5rem, 4.5vw, 2.25rem)   Fraunces 600
body-l      1.125rem                        Nunito 400
body        1rem                            Nunito 400
body-s      0.875rem                        Nunito 400   ← smallest allowed for prose
label       0.8125rem                       Nunito 800 uppercase
```

Never go below `0.8125rem`, anywhere, including legal text and admin.

### 3.4 Layout & spacing

- 4px base scale: `4 8 12 16 24 32 48 64 96 128`.
- Mobile gutter 16px, tablet 24px, desktop 40px. Content max-width 1280px; editorial text max-width 68ch.
- Radii: `--r-sm: 8px` (inputs, chips), `--r-md: 14px` (cards, buttons), `--r-lg: 24px` (sheets, modals), `--r-full` (avatars, badges). Product imagery is **square-cornered** — full-bleed photography reads more cinematic without a radius fighting it.
- Elevation is a two-step system, expressed as shadow on light and as surface lightness on dark. No shadows on dark surfaces.
- **Touch targets: 44×44px minimum, always.** Stepper buttons, bottom-nav items, close buttons, filter chips. The size and colour lists on a product are read-only, but they keep the same 44px box so they sit on the same rhythm. If a design needs a smaller visual, keep the visual small and pad the hit area.

### 3.5 Signature UI patterns

**Bottom navigation (mobile, `< lg`).** Fixed, 5 items: Home · Shop · Categories · Cart · WhatsApp. Safe-area inset padding (`env(safe-area-inset-bottom)`). Cart shows a count badge with an accessible name of "Cart, 3 items". The WhatsApp item is `--in-stock` green, visually last, and is the only item that leaves the site — mark it with an external-link cue in the accessible name.

**Sticky order bar (product page, mobile).** Appears on scroll past the fold: current unit price, quantity stepper, "Add to cart". It never covers the tier meter — the meter is what justifies the price it's showing.

**The Rail.** Horizontal, scroll-snapped product rails on the homepage, styled as a clothes rail: hairline rule above, products "hanging" from it. Native CSS scroll-snap (not a JS carousel — a JS carousel costs ~20KB and breaks keyboard nav). Keyboard-reachable via native focus scrolling. Arrow buttons on `≥ md` with `aria-label`.

**Editorial category openers.** Each category page opens with one full-bleed image and a Fraunces display line. Static, LCP-optimised, no motion above the fold.

### 3.6 Motion language

Framer Motion, used with intent. Motion tokens:

```ts
export const ease = {
  out:    [0.16, 1, 0.3, 1],      // entrances, reveals
  inOut:  [0.65, 0, 0.35, 1],     // transitions between states
  spring: { type: "spring", stiffness: 380, damping: 32 }, // steppers, tier meter, cart badge
} as const;

export const dur = { fast: 0.18, base: 0.32, slow: 0.6, cinematic: 1.1 } as const;
```

Where motion is allowed:

1. **Page-load sequence on the homepage** — hero image scale from 1.06 → 1 over `cinematic`, headline lines rising in a 60ms stagger. Once, on first paint, and never again.
2. **Scroll reveals** — `whileInView` with `viewport={{ once: true, margin: "0px 0px -12% 0px" }}`, 12px rise + fade. Nothing rotates, nothing bounces.
3. **The tier meter** — spring fill, price crossfade + count.
4. **Cart interactions** — item flies to the bottom-nav cart badge; badge springs.
5. **Sheet/dialog** — slide from bottom on mobile, fade+scale on desktop.

Where motion is **forbidden**: on the LCP element after paint, on anything above the fold on category/product pages, on scroll-linked parallax of large images (jank on mid-range Android), and on any property that isn't `transform` or `opacity`.

**Mandatory import pattern** — this keeps ~34KB off the initial bundle:

```tsx
// components/motion/provider.tsx
"use client";
import { LazyMotion, domAnimation } from "framer-motion";
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict>{children}</LazyMotion>;
}
```

Import `m` from `framer-motion`, never `motion`. `strict` mode will throw if anyone forgets. No `AnimatePresence` in the root layout.

**Reduced motion.** A `useReducedMotion()` check gates every non-essential animation; when true, all durations collapse to 0 and transforms are removed — states change, they just don't travel. The homepage load sequence renders as its final frame. Test with the OS setting on.

### 3.7 Dark and light

next-themes with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`.

```tsx
// app/layout.tsx
<html lang="en" suppressHydrationWarning className={`${nunito.variable} ${fraunces.variable}`}>
  <body>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
```

Rules:
- `suppressHydrationWarning` on `<html>` is required. Without it the console errors and Best Practices drops below 100.
- The toggle is a three-state control (Light / Dark / System) in a shadcn dropdown, with `aria-label="Change theme"` and the current value announced. It renders `null` for its icon until mounted to avoid a hydration mismatch — but the **button itself must reserve its exact final size from first paint**, or it shifts layout and costs CLS.
- `<meta name="theme-color">` needs both variants:
  ```tsx
  export const viewport: Viewport = {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#F1F0EC" },
      { media: "(prefers-color-scheme: dark)",  color: "#10132B" },
    ],
  };
  ```
- Product photography is shot on white. On the dark theme, product cards keep a light image surface — do **not** filter or dim product images to match the theme. Customers judge fabric colour from these photos.
- Both themes get a full visual QA pass every phase. A contrast failure in dark mode is a Lighthouse failure.

---

## 4. Information architecture

```text
/                              Home
/shop                          All products (filters as search params)
/shop/new                      New arrivals
/shop/best-sellers             Best sellers
/shop/deals                    Discounted
/wholesale                     Wholesale hub + catalogue request
/category/[slug]               Jeans, Tops, Gowns, Skirts, Bump Shorts,
                               Jackets, Trousers, Two-Piece Sets
/product/[slug]                Product detail
/wishlist                      Saved items (localStorage)
/cart                          Cart
/checkout                      Pickup or delivery + customer details
/order/[orderNumber]           Confirmation
/track                         Order lookup
/visit-us                      Shop location, map, hours, pickup instructions
/about
/contact
/delivery                      Delivery information & zones
/faq
/privacy
/terms

/admin                         Dashboard
/admin/products                List, create, edit
/admin/products/[id]           Editor: the one image, pricing, tiers, colours, sizes, SEO
/admin/categories
/admin/orders                  List, filters, status board
/admin/orders/[id]             Detail, status, notes, WhatsApp deep link
/admin/customers               Derived from orders (phone-keyed)
/admin/promotions
/admin/reviews                 Moderation queue
/admin/delivery                Zones & fees
/admin/analytics
/admin/settings                Business info, WhatsApp number, hours, content
```

Route groups: `(shop)` for the customer site with the bottom nav, `(admin)` with its own shell, `(legal)` for the static pages. Admin is `noindex, nofollow` at the metadata level *and* blocked in `robots.ts`.

---

## 5. Data model (Convex)

```ts
// convex/schema.ts — abbreviated; add indexes as noted

categories: {
  name, slug, description,
  heroImage, orderIndex, isActive,
  seoTitle, seoDescription,
}  // index: by_slug, by_active_order

products: {
  name, slug, sku, description, careInstructions, material,
  categoryId,
  image: { publicId, alt },                  // ONE photograph per product. No galleries.
  retailPrice: number,                       // kobo-free naira integers
  priceTiers: Array<{ minQty: number, unitPrice: number }>,  // sorted asc, tier[0].minQty === 1
  wholesaleMinQty: number | null,
  colors: string[], sizes: string[],         // typed in at upload; listed === available
  isActive, isFeatured, isNewArrival, isBestSeller,
  viewCount, orderCount,
  seoTitle, seoDescription, ogImage,
  createdAt,
}  // indexes: by_slug, by_category_active, by_featured, by_created, by_orderCount

// There is no variants table and no stock count. The admin types in the
// colours and the sizes for a product as they upload it, and only types in the
// ones that are actually in the shop. Whatever is listed is what we have; when
// it goes, the admin edits the list. Anything else a customer wants to know —
// another colour, a size we did not list, when it is coming back — is a
// WhatsApp question, answered by a person.

orders: {
  orderNumber,                       // UDK-YYYYMMDD-NNN
  status: "received"|"awaiting_confirmation"|"confirmed"|"preparing"
        |"ready_for_pickup"|"out_for_delivery"|"delivered"|"cancelled",
  fulfilment: "pickup" | "delivery",
  customer: { name, phone, whatsapp },
  pickup?:   { preferredDate, preferredTime },
  delivery?: { state, city, address, landmark, preferredDate, instructions },
  items: Array<{   // colour and size are stated per item, not chosen on the site
    productId, productName, slug, imagePublicId,
    size, color, quantity,
    unitPrice, appliedTier: "retail" | "wholesale", lineTotal,
  }>,
  subtotal, discount, deliveryFee: number | null,   // null = "to be confirmed"
  total,
  promoCode?: string,
  whatsappOpened: boolean,           // did the handoff actually fire
  adminNotes: string[],
  createdAt, updatedAt,
}  // indexes: by_orderNumber, by_status_created, by_phone, by_created

counters: { key: string, value: number }   // daily order sequence
promotions: { code?, type: "percent"|"fixed"|"bogo"|"wholesale"|"category",
              value, scope, startsAt, endsAt, isActive, usageCount }
reviews:    { productId, name, rating, body, imagePublicId?,
              orderNumber?, isVerified, isApproved, createdAt }
deliveryZones: { state, city?, fee: number | null, etaDays, isActive }
settings:   { key, value }   // WhatsApp number, hours, address, hero content
events:     { type, productId?, orderNumber?, sessionId, createdAt }
```

**Money:** all amounts are integers in naira. No floats anywhere. Format with `Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 })`.

**Wishlist and cart are client-side only** (`localStorage`, versioned key `udk.cart.v1`). Validate every stored line against Convex on cart mount — products get deleted, prices change, colours and sizes get dropped from a product's list. Show a clear, non-apologetic notice when a line is adjusted: *"Blue High-Waist Jeans is no longer available in Mid Blue, size 34. Removed from your cart."*

---

## 6. Pricing engine

One pure function, unit-tested, used identically on product page, cart, checkout and in the Convex order mutation. The client's number and the server's number must never disagree.

```ts
// lib/pricing.ts
export function unitPriceFor(product: Product, qty: number): {
  unitPrice: number;
  tier: "retail" | "wholesale";
  nextTier?: { minQty: number; unitPrice: number; qtyAway: number; saving: number };
}
```

Rules:
1. Tiers are sorted ascending by `minQty`; the applicable tier is the highest whose `minQty <= qty`.
2. A tier is labelled **wholesale** when `wholesaleMinQty !== null && qty >= wholesaleMinQty`.
3. `nextTier` drives the Tier Meter copy: *"Add 2 more to unlock ₦7,200 each — you save ₦7,800."*
4. Promotions apply **after** tier resolution, at the cart level, never by rewriting `unitPrice`.
5. The server recomputes everything from `productId + quantity` at order creation. Client-submitted prices are read for comparison only; a mismatch logs an event and the server value wins.

Product-page display:

```
₦8,500          ← current unit price, Fraunces, price counts on change
per piece · retail
Wholesale from 6 pieces — ₦7,200 each     ← brass, always literal about the threshold
[  −  ][  4  ][  +  ]     ← 44px targets, aria-live="polite" on the value
[ Tier Meter ]
```

---

## 7. Product detail page

The highest-value page on the site. It is statically rendered, its images are the LCP, and it carries the Product structured data.

- **Photograph:** one image per product — no carousel, no second angle, no thumbnail strip. It is the LCP: `priority` + `fetchPriority="high"`, aspect ratio locked in CSS. Full-screen zoom via a dialog, not a JS zoom lens. It needs a real alt: *"Blue high-waist straight-leg jeans, front view"* — never "product image".
- **Colour and size are stated, never selected.** The page lists the colours (swatch *and* colour name, never just a dot) and the sizes the admin entered at upload — which is exactly what is in the shop. They are read-only: no chips to press, nothing struck through, nothing labelled "Sold out", and no stock count the page cannot honour. Which colour and which size a customer wants is named in the WhatsApp conversation and confirmed in the reply, by a person.
- **Enquiries:** an "Ask about this piece" action next to Save and Share, plus a short question box below the description. Both open WhatsApp with the piece already identified — name, SKU, the colours and sizes it comes in, quantity, and the product link — so the customer never describes it twice and can name the one they want in the same message.
- **Below the fold:** description, material, care, SKU, delivery & pickup summary, reviews, "You may also like" (same category, by `orderCount`), recently viewed (localStorage).
- **Share:** native `navigator.share` when available, WhatsApp share fallback. Fashion sells sideways through WhatsApp status — make it one tap.

---

## 8. Cart, checkout and the WhatsApp handoff

### 8.1 Cart
Line items show image, name, colour, size, quantity stepper, unit price, tier label, line total. Tier changes are recomputed live — removing a piece that drops the customer out of wholesale must say so plainly: *"Now ₦8,500 each — you're below the 6-piece wholesale price."* Totals: subtotal, discount, delivery (or "Confirmed on WhatsApp"), total.

### 8.2 Checkout
Single page, three fieldsets, no account required.

1. **Order type** — Pickup or Delivery, as a radio group (not a select).
   - *Pickup* reveals the shop address block, preferred date, preferred time.
   - *Delivery* reveals full name, phone, WhatsApp number, state, city, address, landmark, preferred date, instructions. Fee comes from `deliveryZones`; if the zone has `fee: null`, show **"Delivery fee confirmed on WhatsApp"** and keep `deliveryFee: null` on the order. Never invent a number.
2. **Your details** — name, phone (NG format validation, permissive on spacing and `+234`/`0` prefixes), WhatsApp number with a "same as phone" checkbox.
3. **Review** — full order summary, then **Send order on WhatsApp**.

Form rules: every input has a visible `<label>`, `autoComplete` set correctly (`name`, `tel`, `address-line1`, `address-level2`), `inputMode="tel"` on phone fields, errors tied by `aria-describedby` and announced in an `aria-live="polite"` region, and the first invalid field receives focus on failed submit. Errors say what to do: *"Enter a phone number we can reach you on, like 0806 656 8595."*

### 8.3 Order creation, then handoff

On submit: Convex mutation creates the order (server-priced, server-numbered), returns `orderNumber`, the client composes the message, opens `wa.me`, then routes to `/order/[orderNumber]`.

```ts
const WHATSAPP = "2348066568595";
const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
```

Order number: `UDK-YYYYMMDD-NNN` from an atomic Convex counter keyed by date (`UDK-20260818-001`). Never generated on the client.

Message template — plain text, no markdown, emoji only as section markers:

```
Hello UDKING'S Collections, I would like to place an order.

Order No: UDK-20260818-001
Name: Jane Doe
Phone: 0806 656 8595

ITEMS
1. High Waist Jeans — Blue — Size 32 — 2 pcs @ ₦8,500 = ₦17,000
2. Ribbed Top — Black — Size L — 6 pcs @ ₦3,200 (wholesale) = ₦19,200

Order type: Delivery
Address: 12 Awolowo Road, Ikoyi, Lagos
Landmark: Beside Zenith Bank
Preferred date: 20 Aug 2026

Subtotal: ₦36,200
Delivery: To be confirmed
Total: ₦36,200

Please confirm availability and payment details.
```

Handoff details that matter:
- WhatsApp truncates very long links. If the message would exceed ~1,600 characters, send the first 10 lines plus *"…and 6 more items — see order UDK-20260818-001"* and rely on the order record.
- Open with a real `<a href>` (`target="_blank" rel="noopener"`), not `window.open` — popup blockers eat programmatic opens on iOS Safari.
- Mark `whatsappOpened: true` on click. Orders stuck at `false` are the admin's follow-up list.
- Clear the cart only after the order mutation succeeds.

### 8.4 Confirmation & tracking
`/order/[orderNumber]` shows the number large, order type, item count, total, then **Continue on WhatsApp** and **Track order**. Offer "Save as image" (canvas render) — customers screenshot these constantly.

`/track` takes order number + phone (both required — this is the only access control on the record) and returns the status timeline. Status labels are the customer's words: *Order received · Awaiting confirmation · Confirmed · Preparing your order · Ready for pickup · Out for delivery · Delivered · Cancelled.*

---

## 9. Wholesale hub (`/wholesale`)

Wholesale is a purchasing mode, not a category — but traders need one place to land from a WhatsApp broadcast.

- Wholesale-priced products with the minimum quantity on every card.
- Pack pricing: a trader counts the pieces of a style, one tier calculation runs on the total, and the colour and size breakdown of that pack is agreed on WhatsApp from the lists shown.
- **Request wholesale catalogue** form: name, phone, business name, product interest, estimated quantity → creates a Convex `enquiry` record, then hands off to WhatsApp with the same structured pattern.
- Bulk discount table, rendered from the real `priceTiers` data, not a hardcoded image.

---

## 10. Search, filter, discovery

- **Search** over product name, SKU, category, colour, size. Convex search index; debounced 250ms; results render in a full-screen sheet on mobile with recent searches. Empty state offers categories, not an apology.
- **Filters** as URL search params (`?category=jeans&size=32&color=blue&sort=price_asc`) so they are shareable and server-renderable. Filter sheet on mobile, sidebar on `≥ lg`. Active filters shown as removable chips with a count.
- **Sorts:** newest, price ascending, price descending, popular, best selling.
- **Discovery surfaces:** New Arrivals (by `createdAt`), Best Sellers (by `orderCount`), Trending (views + orders, 7-day window), Deals (active promotions), Recently Viewed (localStorage, mobile-prominent), Related products.
- **Wishlist:** localStorage, no account, count badge, and a "Send wishlist on WhatsApp" action — this is how a customer asks "do you still have these?".

---

## 11. Admin

Clerk-gated at `proxy.ts`. Optimised for a phone: the shop owner will use this standing in the plaza.

- **Dashboard:** today's orders, pending, confirmed, ready for pickup, out for delivery, completed, revenue (day / week / month), product count, best sellers, and **abandoned handoffs** (`whatsappOpened: false`).
- **Products:** create/edit/delete, a single Cloudinary image upload, retail price, tier editor, wholesale minimum, the colour list and the size list for this piece (entered here, at upload — this *is* the availability), flags (featured / new / bestseller), per-product SEO fields.
- **Availability:** editing a product's colour or size list is the whole of inventory management. Removing a colour removes it from sale.
- **Orders:** list with status filters and search by number or phone; detail view with status changes, payment confirmation, notes, and a one-tap WhatsApp link to that customer.
- **Promotions:** percent, fixed, buy-X-get-Y, wholesale-specific, category-wide, flash sale windows.
- **Reviews:** approval queue. Nothing publishes unmoderated.
- **Delivery:** zones and fees, including `null` fees that mean "confirm on WhatsApp".
- **Content & settings:** hero copy and images, hours, address, WhatsApp number, social links, FAQ entries.

All destructive actions confirm. All mutations are optimistic with rollback on failure and a toast that names what happened.

---

## 12. SEO

Target queries: *ladies wear Lagos Island · women's clothing Lagos · wholesale ladies wear Lagos · wholesale clothes Lagos Island · jeans wholesale Lagos · ladies jeans Lagos · ladies tops Lagos · gowns Lagos · skirts Lagos · bump shorts Lagos · jackets Lagos · fashion store Lagos Island.*

Requirements:
- Metadata API on every route. `metadataBase` set. Titles 50–60 chars via a template (`%s | UDKING'S Collections`), descriptions 140–160 chars, written per product — never generated by concatenating attributes.
- `generateMetadata` on `/product/[slug]` and `/category/[slug]`, with canonical URLs and per-product OG images (Cloudinary transformation, 1200×630).
- `app/sitemap.ts` — dynamic, includes every active product and category with `lastModified`. `app/robots.ts` — allow all except `/admin`, `/checkout`, `/cart`, `/order`.
- **JSON-LD** (`<script type="application/ld+json">`, server-rendered):
  - `Product` + `Offer` on PDP — `price`, `priceCurrency: "NGN"`, `availability` always `InStock` — an inactive product is delisted, not marked out of stock, `sku`, `brand`, `image`, `AggregateRating` only when real reviews exist.
  - `BreadcrumbList` on category and product pages.
  - `LocalBusiness` / `ClothingStore` on `/` and `/visit-us` — full address, geo, `openingHoursSpecification`, `telephone`.
  - `WebSite` + `SearchAction` on `/`.
- Crawlable navigation: every link is an `<a>`/`<Link>` with descriptive text. No `onClick`-only navigation, no "Click here", no "Read more" as the entire link text.
- One `<h1>` per page, headings in order, no skipped levels.
- Localised copy: prices in ₦, sizes as Nigerian market sizes, "pieces" not "units", place names spelled as customers search them.

---

## 13. PWA

- `app/manifest.ts`: name, short name "UDKING'S", `display: "standalone"`, `start_url: "/?source=pwa"`, `theme_color` matched to the light theme, maskable 192/512 icons, `categories: ["shopping"]`, screenshots for the install prompt.
- Custom install prompt: capture `beforeinstallprompt`, show a dismissible bar after the second visit or after an order — never on first paint.
- **Service worker: optional and deliberate.** Convex is realtime; a naive cache-first worker will serve stale prices and stale colour lists. If one ships, it caches the app shell, fonts and images only — `NetworkOnly` for every Convex request, and a versioned cache with a clean upgrade path. Ship it in Phase 7 or not at all.
- Offline page: brand-consistent, lists the shop address and a `tel:` link, because a customer with no data can still call.

---

## 14. The Lighthouse contract

Scored on **mobile emulation, Moto G Power, 4× CPU throttle, simulated slow 4G**, against the production build, on `/`, `/shop`, `/category/jeans`, `/product/[any]`, `/cart`, `/visit-us`. All four categories must read **100**. Verify with:

```bash
npx unlighthouse --site https://<domain>   # crawls every route
# or per-route:
npx lighthouse https://<domain>/product/x --preset=desktop=false --view
```

### 14.1 Performance

Budgets, enforced in CI (`bundlesize` or `next build` output check):

| Metric | Budget |
|---|---|
| First-load JS, any public route | **≤ 130 KB gzipped** |
| LCP | ≤ 1.8s (mobile, throttled) |
| CLS | **0** |
| INP | ≤ 200ms |
| TBT | ≤ 150ms |
| Total page weight, PDP | ≤ 900 KB |

How we get there:

- **Server Components by default.** `"use client"` only on: cart, quantity stepper, variant selector, filter sheet, theme toggle, search sheet, motion wrappers. Push client boundaries as far down the tree as possible — a client `<AddToCart>` inside a server `<ProductPage>`, never the reverse.
- **Images:** `next/image` with a Cloudinary loader emitting `f_auto,q_auto:good,dpr_auto,c_limit`. Explicit `sizes` on every image. `priority` + `fetchPriority="high"` on the single LCP image per route; everything else lazy. Aspect ratio locked in CSS so nothing reflows. AVIF/WebP via `f_auto`.
- **Fonts:** self-hosted through `next/font`, `display: "swap"`, `latin` subset, preloaded, and the fallback metrics adjusted (`adjustFontFallback` is on by default — keep it) so the swap causes **zero** shift.
- **Framer Motion:** `LazyMotion` + `domAnimation` + `m` only (§3.6). No `motion` import survives review. Heavy animated sections are `next/dynamic` with `ssr: false` **only** when below the fold.
- **Third parties:** none above the fold. Analytics loaded with `next/script` `strategy="afterInteractive"`. No chat widget SDK — the WhatsApp button is a link. No Google Maps JS on `/visit-us` — use a static map image that links out to Maps, and lazy-load an iframe behind a click.
- **Data:** Convex queries for above-the-fold content run server-side and are cached; below-the-fold queries stream in Suspense boundaries whose skeletons match the final layout height exactly.
- **CLS = 0 checklist:** every image has dimensions; every skeleton matches its content's height; the theme toggle reserves size before mount; the sticky order bar is `position: fixed` (never pushing layout); badges reserve width for two digits; no ads, no late-injected banners; the install prompt animates in over content, never above it.

### 14.2 Accessibility

- Semantic landmarks: one `<header>`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`. The bottom nav is `<nav aria-label="Quick actions">`.
- Skip link to `#main`, visible on focus, first in the DOM.
- Visible focus on every interactive element — `focus-visible` ring of 2px `--hibiscus` / `--hibiscus-lift` with 2px offset, and **it must be visible against both themes and against product photography**.
- Full keyboard operation: the photograph's zoom dialog, filter sheet, quantity stepper, dialogs (Radix handles focus trap and restore — don't hand-roll). The colour and size lists are static content, so there is nothing there to tab to.
- Every icon-only button has an `aria-label`. Every image has a meaningful `alt`; decorative images get `alt=""`.
- Live regions: cart count, quantity value, filter result count, form errors — `aria-live="polite"`, never `assertive`.
- Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI boundaries and focus rings, **in both themes**. Text over hero imagery needs a gradient scrim tuned to the actual photo, not a guess.
- Touch targets ≥ 44×44px with ≥ 8px spacing.
- `lang="en"`, correct heading order, no positive `tabindex`, no `role` where a semantic element exists.
- Reduced motion respected everywhere (§3.6).
- **Automated 100 is the floor, not the goal.** Each phase ends with a manual pass: keyboard-only checkout, VoiceOver on iOS through a product page, and 200% zoom on a 360px viewport.

### 14.3 Best Practices

- HTTPS only; HSTS.
- **Zero console errors or warnings in production**, including hydration warnings. This is the most common way this score drops.
- Security headers in `proxy.ts`:
  ```
  Content-Security-Policy      (nonce-based; script-src 'self' 'nonce-…' 'strict-dynamic')
  Strict-Transport-Security    max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options       nosniff
  Referrer-Policy              strict-origin-when-cross-origin
  Permissions-Policy           camera=(), microphone=(), geolocation=(), interest-cohort=()
  X-Frame-Options              DENY
  ```
  CSP must allow `res.cloudinary.com`, the Convex deployment, Clerk and WhatsApp. Test in report-only first, then enforce.
- Images served at correct intrinsic resolution (no 2000px file in a 400px slot) and with valid aspect ratios.
- No deprecated APIs, no `unload` listeners, no `document.write`.
- Source maps uploaded to error tracking but not publicly served in production.

### 14.4 SEO
Covered in §12. The score is mostly free once §12 is done; the two that catch people are non-descriptive link text and a missing/duplicated meta description on dynamic routes.

---

## 15. Project structure

```text
app/
  (shop)/
    layout.tsx                 header + bottom nav + MotionProvider
    page.tsx                   home
    shop/…  category/[slug]/  product/[slug]/  wholesale/
    cart/  checkout/  order/[orderNumber]/  track/
    wishlist/  visit-us/  about/  contact/  delivery/  faq/
  (legal)/privacy/  terms/
  (admin)/admin/…
  api/                         only where a route handler is genuinely needed
  layout.tsx  globals.css  fonts.ts
  manifest.ts  robots.ts  sitemap.ts  opengraph-image.tsx
  not-found.tsx  error.tsx  global-error.tsx
proxy.ts                       headers, CSP nonce, Clerk admin gate
components/
  ui/                          shadcn, restyled to tokens
  product/  cart/  checkout/  admin/  layout/  motion/  seo/
convex/
  schema.ts  products.ts  variants.ts  orders.ts  promotions.ts
  reviews.ts  settings.ts  analytics.ts  lib/orderNumber.ts
lib/
  pricing.ts  whatsapp.ts  format.ts  cloudinary.ts  validators.ts
  cart-store.ts  wishlist-store.ts
docs/
  DECISIONS.md  CONTRAST.md  LIGHTHOUSE.md
```

---

## 16. Build phases

Each phase ends with: typecheck clean, lint clean, both themes reviewed, keyboard pass, Lighthouse run recorded in `/docs/LIGHTHOUSE.md`.

**Phase 0 — Foundation.** Next.js + TS strict + Tailwind + shadcn. Tokens in `globals.css`. Fonts. next-themes with a working three-state toggle and no flash, no hydration warning, no layout shift. `proxy.ts` with headers and CSP. Convex connected, schema deployed, seeded with 12 real products across 4 categories. Clerk on `/admin`.
*Gate: an empty styled page scores 100/100/100/100.*

**Phase 1 — Design system.** Buttons, inputs, chips, swatches, cards, sheets, dialogs, skeletons, empty states, toasts — all in both themes. `MotionProvider`, motion tokens, reduced-motion hook. Header, footer, bottom nav. Product card in its three densities (rail, grid, list).
*Gate: a component gallery route passes contrast and keyboard audit in both themes.*

**Phase 2 — Catalogue.** Home with the cinematic hero and rails. Category pages with editorial openers. `/shop` with filters, sorts and pagination as search params. Product detail: the single photograph, colour and size selection, the WhatsApp enquiry, related, recently viewed. Search.
*Gate: PDP scores 100 across the board with a full-weight product photograph.*

**Phase 3 — Pricing & cart.** `lib/pricing.ts` with unit tests covering tier boundaries, single-tier products, and promo interaction. The Tier Meter. Cart with live re-tiering, validation against Convex, wishlist.

**Phase 4 — Checkout & handoff.** Checkout form with full a11y, delivery zones, Convex order mutation with atomic numbering, server-side repricing, WhatsApp message composer with truncation, confirmation page, `/track`.
*Gate: end-to-end order on a real phone, both fulfilment types, message arrives correctly formatted on WhatsApp.*

**Phase 5 — Admin.** Dashboard, products, tier and variant editors, Cloudinary upload, inventory grid, orders board, customers, delivery zones, settings.

**Phase 6 — Growth.** Promotions engine, reviews with moderation, analytics events, social gallery, wholesale hub with mixed packs and catalogue request.

**Phase 7 — Hardening.** PWA manifest and install prompt, optional service worker, structured data verified in Rich Results Test, sitemap and robots verified in Search Console, full Lighthouse sweep with `unlighthouse`, 200% zoom pass, VoiceOver pass, real-device test on a mid-range Android over 3G.

---

## 17. Definition of done

- [ ] Lighthouse **100 / 100 / 100 / 100** on mobile emulation for `/`, `/shop`, `/category/jeans`, a product page, `/cart`, `/visit-us` — recorded with dates in `/docs/LIGHTHOUSE.md`.
- [ ] CLS is 0.000 on every measured route.
- [ ] First-load JS ≤ 130 KB gzipped on every public route.
- [ ] Zero console output in production, including hydration warnings.
- [ ] Full checkout completable with keyboard only, and with VoiceOver only.
- [ ] Both themes reviewed on every route; all token pairs recorded in `/docs/CONTRAST.md` with measured ratios.
- [ ] `prefers-reduced-motion` collapses every animation; the site remains fully usable.
- [ ] Order numbers are unique under concurrent submission (test with 50 parallel mutations).
- [ ] Server-side prices match client-side prices in every tier-boundary test case.
- [ ] Rich Results Test passes for Product, BreadcrumbList and LocalBusiness.
- [ ] Sitemap contains every active product; `/admin` is absent from it and blocked in robots.
- [ ] A real order placed from a real Android phone on throttled data arrives in WhatsApp correctly formatted.

---

## 18. Things to get right that are easy to get wrong

1. **Don't dim product photos in dark mode.** Fabric colour is the purchase decision.
2. **Never show a delivery fee you can't stand behind.** `null` means "confirmed on WhatsApp", and the UI must say exactly that.
3. **Price the order on the server.** Every time. The client is a display layer.
4. **The wholesale threshold is stated in words, always** — "from 6 pieces" — not implied by a colour or a table row.
5. **`window.open` for the WhatsApp handoff will fail on iOS.** Use an anchor.
6. **A JS carousel will cost you the performance budget and the keyboard audit.** CSS scroll-snap does the job.
7. **The theme toggle is the most common CLS source in this stack.** Reserve its box before mount.
8. **Suspense skeletons must match final height exactly**, or streamed content shifts the layout and CLS is no longer 0.
9. **Empty states are invitations.** An empty cart offers categories; an empty search offers new arrivals; an empty wishlist explains what the heart does.
10. **Copy in the interface's voice.** "We don't have that one", not "Sorry, this item is currently unavailable at this time!"
11. **Never offer a colour or a size we do not have, and never make the customer pick one on the site.** The lists on a product *are* the availability; naming one — and anything beyond them — is a WhatsApp conversation, not a form field.
