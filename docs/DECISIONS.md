# Decisions

Where the build spec left a choice open, this is what was chosen and why.

## Fonts — Nunito only

The spec asks for Nunito plus Fraunces. The brief for this build asked for
**Nunito only**, so the display voice is Nunito 900 at tight tracking
(`-0.03em`, leading 0.98) and the utility voice is Nunito 800 uppercase at
`0.12em`. One family is also one fewer render-blocking asset on a 3G phone,
which the Lighthouse contract cares about more than a second typeface does.

## Data layer — Convex

The catalogue, orders and the daily order counter live in Convex. The tables in
`convex/schema.ts` are §5 of the build spec, and the app's own types in
`lib/types.ts` are unchanged — every query maps through `convex/model.ts` so the
shapes components consume are exactly what they were before.

`lib/catalog.ts` still holds the whole read API (`getProducts`, `productBySlug`,
`relatedTo`, …) and is still server-only: every caller is a Server Component or
a server action, and client components go through `app/actions.ts`. The
catalogue never enters a browser bundle, which is what keeps first-load JS where
`docs/LIGHTHOUSE.md` records it.

**Reads are cached, not per-request.** A database round trip on every visit
would make every route dynamic and cost the LCP the design is built around. So
catalogue reads are wrapped in `unstable_cache` under a shared `catalog` tag,
and the admin calls `updateTag("catalog")` after a write — the storefront
rebuilds on edit, not on every visit. `yarn build` still prerenders the home
page, all twelve product pages, and every static route.

`unstable_cache` is superseded by the `use cache` directive in Next 16, which
needs `cacheComponents: true` and a Suspense pass over all twenty routes. That
migration is worth doing and is **not** done here — this is the
behaviour-identical step that does not touch every page at once.

**The deployment is `polite-shrimp-139`, a dev deployment.** That is correct for
building and wrong for real customers: a dev deployment is tied to `npx convex
dev`, is designed to be reset, and is not where real orders should live. It is
also *not* private — a dev deployment has a public URL exactly like prod, so it
buys no security. Before launch: create the prod deployment, set `ADMIN_SECRET`
on it, run `npx convex run seed:run` against it, and point
`NEXT_PUBLIC_CONVEX_URL` at it.

## Availability — the colour and size lists, not a stock matrix

There is no variant table, no per-size stock count and no "Sold out" state.
The admin types a product's colours and sizes in as they upload it, and only
types in what is in the shop; when something goes, they edit the list. The list
*is* the availability, and the site never has a stock number to be wrong about.

**Colour and size are chosen on the product page.** (Superseded — they used to
be stated read-only and settled entirely on WhatsApp.) The lists are still the
availability, so every option is selectable and there is no disabled state; what
changed is that the customer's pick travels with the order instead of being
re-typed into a message. Radio inputs, one option pre-selected when there is
only one, and Add to cart refuses until both are chosen.

A cart line is now one product *and* one colour and size — the same style in two
colours is two lines. The choice can be changed in the cart, and cart validation
drops a colour or size the shop has stopped stocking and says so. Convex accepts
a choice only if the product's live list still contains it, the same way it
refuses client-sent prices.

WhatsApp is still where it is confirmed: the order message states the chosen
colour and size per item and asks the shop to confirm, falling back to "any of
…" plus the old ask for a line that carries no choice. The "Ask about this piece"
action next to Save and Share, and the question box under the description, do
the same for a question — piece identified (name, SKU, its colours and sizes,
quantity, link), question in the customer's own words.

## Product photography — one real photograph per product

Each product carries exactly one image, at `public/catalogue/<slug>.jpg` —
no galleries, no second angles, no thumbnail strip. One photograph is one LCP
image on a 3G phone, and it is what the shop can realistically shoot for every
piece. The full-screen zoom dialog stays.

The catalogue ships real photography: `public/catalogue/*.jpg`, portrait 4:5 for
products and landscape for the category/home heroes. No SVG garment art remains
anywhere in the app — the generated silhouettes were removed.

The current files are free-licence placeholders from Unsplash (see
`docs/image-credits.md`). Replacing one with a real UDKING'S shop photograph is a
file swap at the same path; no code changes. Photographs are shot on white and
are **never dimmed in dark mode**, per §18.1, enforced in the components.

## Dialogs — Base UI, not Radix

`shadcn` v4 in this project ships on `@base-ui/react`. It gives the same
focus-trap and focus-restore guarantees the spec relies on. It is used only on
the two routes that genuinely need a dialog (gallery zoom, filter sheet), never
globally — see below.

## Motion — Framer on two routes, CSS everywhere else

The spec mandates `LazyMotion` + `m`. That is exactly what
`components/motion/provider.tsx` does, and `strict` is on.

But `MotionProvider` is **not** in the root layout. Framer loads only on the
home page (the hero sequence) and the product page (price crossfade, tier
meter, sticky bar). Scroll reveals, the cart badge and the install prompt were
the components that would have dragged Framer onto every route, so they are
IntersectionObserver plus two CSS properties instead. Same motion language,
about 35KB less on routes that never needed it.

## Search — a route, not a global dialog

A search dialog in the header puts a popover engine on every route for a
control most visits never open. `/search` is a server-rendered page with a
plain GET form: it works before hydration, it is linkable and crawlable, and it
costs nothing on routes that are not it. Filters stay as URL search params, so
a filtered view is still shareable on WhatsApp.

## Theme toggle — native `<select>`

Three states, keyboard- and screen-reader-correct for free, no popover library
on every route. It reserves its exact final size before mount, which is the
actual CLS risk the spec warns about.

## Order records — Convex, and the lock is gone

Orders and the date-keyed counter are Convex tables. Pricing, order numbering
and the insert all happen inside **one** mutation (`convex/orders.ts`), so the
totals cannot disagree with the catalogue and a number cannot be issued twice.

The previous file-backed store serialised writes through a promise lock. That
lock only ever held within one process — two instances would have handed the
same order number to two customers, silently. Convex mutations are serializable
transactions, so the counter's read-modify-write is atomic across every
instance and the lock is gone rather than moved.

Verified against the live deployment: 25 parallel `orders:create` calls issued
25 distinct order numbers. The old `lib/order-store.test.ts` proved this against
the file store; that guarantee now belongs to the database, so the test went
with the store. What remained pure — WhatsApp message composition — moved to
`lib/whatsapp.test.ts` and still runs with no deployment.

The client sends product ids and quantities. It does not send prices, and if it
did they would be ignored.

## Logo — transparency was derived, not assumed

`public/logo.webp` as supplied is gold-on-black in lossy VP8, with **no alpha
channel** — an opaque near-black plate (`rgb(7,7,7)`). Dropped straight into
the header it renders as a black rectangle on the oyster theme.

The background was keyed to transparency with a smoothstep on luminance
(threshold 10 → 46, well clear of the artwork's own ink), keeping the original
pixel colours rather than unpremultiplying — an additive unpremultiply washed
the gold out badly on light surfaces. The result composites correctly on both
`--oyster` and `--indigo-900`, and is what `/logo.webp` now holds.

The supplied original is preserved untouched at `public/logo-on-black.webp` in
case the black plate is wanted somewhere deliberately.

The PWA icons in `public/icon-*.png` and `app/apple-icon.png` are generated
from `/logo.webp` onto the `--oyster` background that the manifest declares as
`background_color`. The maskable variant is inset to the middle 60% so Android
can crop it to any shape without clipping the mark.

One caveat: `next/image` falls back to JPEG — which has no alpha — for clients
that accept neither WebP nor AVIF. Every browser in this project's support
baseline (Chrome/Edge/Firefox 111+, Safari 16.4+) accepts WebP, so this only
affects clients already outside the baseline.

## Admin auth — a passcode, not Clerk

The spec puts Clerk on `/admin`. The shop admin does not use email, so an
email-first sign-up flow was the wrong front door. Clerk with passkeys and email
disabled was the stronger option and is still the one to move to; a passcode was
chosen because it needs no coordination with a person who is not in the room.

**Two environment variables, neither `NEXT_PUBLIC_`:**

- `ADMIN_PASSCODE` — what the admin types. The only thing a person knows.
- `ADMIN_SECRET` — 32+ random characters, set identically in `.env.local` and on
  the Convex deployment (`npx convex env set ADMIN_SECRET …`). It signs the
  session cookie and authorises every Convex write. No person ever types it.

**Three layers, in ascending order of importance:**

1. `proxy.ts` redirects `/admin/*` to `/admin/login` without a valid session
   cookie. This protects the *page* and nothing else.
2. Every server action in `app/(admin)/actions.ts` verifies the cookie before it
   does anything.
3. Every mutation in `convex/admin.ts` calls `requireAdmin` as its first
   statement, comparing `ADMIN_SECRET` in constant time.

Layer 3 is the wall. Convex functions are public HTTP endpoints and the
deployment URL ships in the client bundle, so a route gate alone would leave
every mutation callable with `curl`. This is the single easiest thing to get
wrong in a Convex app, and it is why the browser never talks to Convex at all:
server actions hold the secret, and the browser holds a signed cookie that
proves a passcode was entered and nothing more.

**Details that matter:**

- Both secret comparisons are constant-time. Convex runs a V8 isolate, not Node,
  so `crypto.timingSafeEqual` is unavailable there and the comparison is written
  by hand; the Next side uses Web Crypto so `proxy.ts` can verify the same
  cookie on the edge runtime.
- The cookie is `httpOnly`, `sameSite=lax`, `secure` in production, and holds
  `<expiry>.<hmac>` — never the passcode. Sessions last twelve hours.
- Sign-in is rate limited to five attempts per fifteen minutes per IP. Without
  it the login action is an unlimited-guess oracle in front of a human-chosen
  passcode, which is what makes shared-secret auth indefensible.
- Missing or short secrets **fail closed**. A deployment without them admits
  nobody rather than everybody.
- One error message for every failure. The form never says whether a guess was
  close, or whether it was wrong versus rate-limited.

**What this costs, stated plainly:**

- **No identity and no audit trail.** Every change is "someone who knew the
  passcode". With two people in the admin, you cannot tell who did what.
- **Rotation means a redeploy** of both Next and Convex, which in practice means
  it will not be rotated.
- **One leak is total** — the catalogue plus every customer's name, phone number
  and delivery address. There is no second factor to fall back on.
- **The rate limiter is in-memory**, so it is per-instance and resets on deploy.
  On a single instance it is the real thing; across several it multiplies the
  allowance by the instance count. If it matters, it belongs in a Convex table.

This is a single-operator tradeoff. Revisit it the moment a second person needs
admin access, or if the shop starts holding anything more sensitive than it does
today. The migration path is Clerk with passkeys — no email, no fingerprint
hardware required (a phone's screen-lock PIN satisfies WebAuthn), and the
passcode flow can bootstrap the first passkey enrolment remotely.

## Admin scope — the foundation, not Phase 5

`/admin` today is: sign in, sign out, a three-number summary, and the twenty
most recent orders. The Convex write path is complete and guarded
(`createProduct`, `updateProduct`, `setArchived`, `setOrderStatus`), but the
screens that drive it are not built.

Still to come, per §16 Phase 5: the product editor, the tier and variant
editors, image upload, the inventory grid, the orders board, customers and
delivery-zone settings.

Products are **archived, never deleted**. Orders carry a product id, and a
deleted row would leave a past order pointing at nothing.

## Delivery zones — still static

`lib/zones.ts` holds the zones and their fees. §5 of the spec puts them in a
table so the admin can edit them; that table is not in `convex/schema.ts` yet.
Zone lookup happens in the Next server action, which resolves the state and city
onto the order. It belongs with the rest of Phase 5.

**The zone fee is a guide, not the price of a delivery.** Only the shop sets the
fee for an actual order, once it has seen the address and the load, so
`createOrder` sends `deliveryFee: null` for every delivery — the site never
writes a number a person did not agree to, and the order total is the goods
alone. The zone fees still publish on `/delivery` and next to the zone picker,
worded as what that zone usually costs. The customer is told this before the
handoff, not after: on the checkout summary, on the order screen directly above
the WhatsApp button, and in the message itself, which asks the shop to confirm
the fee and labels the figure "Total for the goods".
