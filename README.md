# UDKING'S Collections

A cinematic, mobile-first fashion catalogue and WhatsApp ordering platform for
UDKING'S Collections — Shop BF04, Andora Plaza, Breadfruit Street, Lagos Island.

Built to `BUILD-SPEC.md`. Where the spec left a decision open, or where this
environment forced one, it is recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md).

## The one architectural rule

**WhatsApp is the conversation. The order record is the record.**

```
Customer → Cart → Checkout
                    ↓
          Server creates the order, priced from scratch
                    ↓
          Order number UDK-YYYYMMDD-NNN, from an atomic counter
                    ↓
          Structured message composed → wa.me link
```

The order exists, with its number and status, whether or not the customer ever
presses send in WhatsApp. Orders left at `whatsappOpened: false` are the shop's
follow-up list.

## Running it

```bash
yarn dev          # http://localhost:3000
yarn build        # production build
yarn start

yarn test         # pricing, order numbering, WhatsApp composition
yarn typecheck
yarn lint
```

## Where things live

| Path | What |
|---|---|
| `lib/pricing.ts` | The wholesale ladder. One pure function, used identically on the product page, in the cart, at checkout and on the server. Unit tested at every tier boundary. |
| `lib/catalog.ts` | Products, each with one image and the colour and size lists it comes in (stated on the page, chosen on WhatsApp). Server only — never reaches a browser bundle. |
| `lib/order-store.ts` | Order records and the atomic, date-keyed order counter. |
| `app/actions.ts` | Server actions: order creation (server-priced), cart validation, tracking, catalogue lookups for client components. |
| `lib/whatsapp.ts` | The message composer, including truncation for very long orders. |
| `components/product/tier-meter.tsx` | The signature element: the wholesale ladder, filling toward the next rung. |
| `proxy.ts` | Security headers and the CSP nonce (Next 16 renamed middleware to proxy). |
| `docs/` | Decisions, measured contrast ratios, and the performance record. |

## Known gaps

- **`/admin` is not built.** Every admin route is Clerk-gated by definition and
  there are no credentials here. `proxy.ts` marks where the gate goes.
- **First-load JS misses the spec's 130 KB budget.** The Next 16 + React 19
  framework baseline alone is ~166 KB gzipped. What was cuttable was cut —
  see [`docs/LIGHTHOUSE.md`](docs/LIGHTHOUSE.md) for the measurements and the
  reasoning.
- **Lighthouse has not been run.** No Chrome and no deployed URL in this
  environment. The contract is built to; it is not yet verified by a real run.
- **Product photography is generated SVG.** Colour-accurate silhouettes on a
  white studio ground, in the ratio the layouts lock, so real photographs drop
  straight in.
