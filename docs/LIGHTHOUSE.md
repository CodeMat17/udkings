# Lighthouse & performance record

## 2026-08-19 — first-load JavaScript, measured

Measured against the production build (`next build && next start`) by fetching
each route and gzipping every `<script src>` the HTML requests. This is the
real first-load payload, not an estimate.

| Route | First-load JS (gzipped) | Budget |
|---|---|---|
| `/` | 205.4 KB | ≤ 130 KB |
| `/shop` | 231.4 KB | ≤ 130 KB |
| `/category/jeans` | 231.4 KB | ≤ 130 KB |
| `/product/[slug]` | 259.6 KB | ≤ 130 KB |
| `/cart` | 207.0 KB | ≤ 130 KB |
| `/visit-us` | 205.1 KB | ≤ 130 KB |
| `/checkout` | 203.3 KB | ≤ 130 KB |

**The 130 KB budget is not reachable on this stack, and the reason is the
framework, not the application.** Breaking down the three largest chunks on
`/terms` — a page with no application JavaScript beyond the shared shell:

| Chunk | Gzipped | What it is |
|---|---|---|
| `37ukl2sboo9lr.js` | 71.6 KB | `react-dom` |
| `0cz1d0mv5g_q7.js` | 38.7 KB | React + Next runtime |
| `157vapexxe3bb.js` | 33.8 KB | Next App Router / navigation |
| others | ~40 KB | router, prefetch, polyfills |

That floor is roughly **166 KB gzipped before a single line of our code runs**.
Next.js 16 with React 19.2 cannot serve a public route under 130 KB. The spec's
budget was written against a lighter baseline.

### What was cut to get from 298 KB to ~205 KB

The first working build shipped 292–302 KB on every route. Three things were
loading globally that did not need to:

1. **A popover library on every route** for the theme menu. Replaced with a
   native `<select>` (`components/layout/theme-toggle.tsx`) — three states,
   correct for keyboard and screen readers, zero library.
2. **A dialog library on every route** for the header search sheet. Replaced
   with `/search`, a server-rendered page with a plain GET form. It also works
   before hydration and is crawlable, which the dialog never was.
3. **Framer Motion on every route**, pulled in by scroll reveals, the cart
   badge, the install prompt and the home hero. Those are now
   IntersectionObserver and CSS keyframes. Framer loads only on
   `/product/[slug]` now (price crossfade, tier meter, sticky bar), which is
   why the product page is the heaviest route and `/checkout` the lightest.

   The hero was the important one: an animation library renders the headline
   at `opacity: 0` in the server HTML, so the LCP text is invisible until
   hydration — on exactly the connections this site is built for. In CSS it
   paints immediately and animates from there.

The catalogue was also moved off the client entirely — search, recently-viewed,
the wishlist and cart validation all read through server actions
(`app/actions.ts`), so `lib/catalog.ts` never enters a browser bundle.

### Remaining levers, if the budget must be met

- Drop `sonner` (~10 KB) for a hand-rolled live region. The brief asked for
  sonner specifically, so it stayed.
- Drop Framer entirely and express the hero and tier meter in CSS. Doable;
  costs the spring on the tier meter, which is the one place the design is
  meant to show off.
- Neither closes a 75 KB gap on its own. The framework floor is the binding
  constraint.

## Not yet measured

Lighthouse itself has not been run — this environment has no Chrome and no
deployed URL. Everything below is built to the contract but unverified by a
real run, and should be measured before launch:

```bash
npx unlighthouse --site https://<domain>
npx lighthouse https://<domain>/product/<slug> --preset=desktop=false --view
```

What has been done in service of those scores:

- **CLS**: every image has explicit dimensions or a locked aspect ratio; the
  theme toggle reserves its exact box before mount; the cart badge reserves
  width for two digits; the sticky order bar and bottom nav are `position:
  fixed`; the install prompt animates over content, never above it.
- **LCP**: one `priority` + `fetchPriority="high"` image per route, everything
  else lazy; fonts self-hosted through `next/font` with `display: swap` and
  `adjustFontFallback` left on.
- **Accessibility**: skip link, landmarks, 44px targets, visible focus rings
  measured against both themes (`docs/CONTRAST.md`), live regions on the cart
  count, quantity, filter count and form errors, and no colour-only signals.
- **Best Practices**: security headers and a nonce-based CSP in `proxy.ts`
  (report-only until a real deployment can be watched), no console output, no
  third-party scripts, `suppressHydrationWarning` on `<html>` for next-themes.
- **SEO**: metadata on every route, canonicals, dynamic sitemap, robots
  blocking `/admin`, `/cart`, `/checkout` and `/order`, and server-rendered
  JSON-LD for Product, BreadcrumbList, ClothingStore and WebSite.

## Test suite

```bash
yarn test       # 12 tests: pricing tiers, catalogue ladder invariants, WhatsApp composition
yarn typecheck
yarn lint
```

`lib/pricing.test.ts` covers every tier boundary, the wholesale label, clamping
and the seed catalogue's own ladder invariants. `lib/whatsapp.test.ts` covers
message composition: the colour and size prompt, an unconfirmed delivery fee
stated in words, pickup orders, and truncation of a long order without losing
its totals or its order number.

Order numbering is no longer tested here. It used to be proven against the
file-backed store with 50 parallel writes; it is now a property of Convex's
serializable mutations, verified against the live deployment (25 parallel
`orders:create` calls, 25 distinct numbers). Re-run that check against the
**production** deployment before launch — it is a §17 line item.

### Not yet re-measured after the Convex migration

The first-load JS figures above were taken before the catalogue moved to
Convex. The catalogue still never enters a client bundle and no Convex client
library is shipped to the browser, so the numbers should be unchanged — but
they are unverified. Re-measure before launch.
