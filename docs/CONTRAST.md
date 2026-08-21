# Contrast

Every token pair actually used together, measured with the WCAG 2.x relative
luminance formula. Regenerate after any token change — the numbers below are
computed, not estimated.

Thresholds: **4.5:1** for text, **3:1** for UI boundaries and focus rings.

## Light theme — oyster surfaces

| Pair | Colours | Ratio | Result |
|---|---|---|---|
| Body text | `#14162E` on `#F1F0EC` | 15.55:1 | PASS |
| Body text on card | `#14162E` on `#FFFFFF` | 17.74:1 | PASS |
| Secondary text | `#55525C` on `#F1F0EC` | 6.70:1 | PASS |
| Accent text / links | `#C2185B` on `#F1F0EC` | 5.15:1 | PASS |
| Accent on card | `#C2185B` on `#FFFFFF` | 5.87:1 | PASS |
| Primary button label | `#FFFFFF` on `#C2185B` | 5.87:1 | PASS |
| Wholesale text | `#866711` on `#F1F0EC` | 4.65:1 | PASS |
| Wholesale on card | `#866711` on `#FFFFFF` | 5.30:1 | PASS |
| In stock text | `#1B6B4A` on `#F1F0EC` | 5.67:1 | PASS |
| Sold out text | `#9A3226` on `#F1F0EC` | 6.44:1 | PASS |
| Border / focus ring | `#C2185B` on `#F1F0EC` | 5.15:1 | PASS |
| Input border | `#8C8A84` on `#FFFFFF` | 3.45:1 | PASS |
| Input border on page | `#8C8A84` on `#F1F0EC` | 3.03:1 | PASS |

## Dark theme — indigo surfaces

| Pair | Colours | Ratio | Result |
|---|---|---|---|
| Body text | `#F4F5FB` on `#10132B` | 16.78:1 | PASS |
| Body text on card | `#F4F5FB` on `#191D3D` | 15.03:1 | PASS |
| Secondary text | `#A9AEC9` on `#10132B` | 8.33:1 | PASS |
| Accent text / links | `#FF5C8A` on `#10132B` | 6.22:1 | PASS |
| Accent on card | `#FF5C8A` on `#191D3D` | 5.57:1 | PASS |
| Primary button label | `#10132B` on `#FF5C8A` | 6.22:1 | PASS |
| Wholesale text | `#E8C36A` on `#10132B` | 10.82:1 | PASS |
| Wholesale on card | `#E8C36A` on `#191D3D` | 9.69:1 | PASS |
| In stock text | `#5BD6A0` on `#10132B` | 10.06:1 | PASS |
| Sold out text | `#FF8B7A` on `#10132B` | 8.02:1 | PASS |
| Focus ring | `#FF5C8A` on `#10132B` | 6.22:1 | PASS |
| Input border | `#5763BD` on `#191D3D` | 3.06:1 | PASS |
| Input border on page | `#5763BD` on `#10132B` | 3.41:1 | PASS |

## Pairings that are forbidden, and why

These fail, which is exactly why the palette has a `-lift` variant for each
accent. They are recorded here so nobody re-derives the mistake.

| Pair | Colours | Ratio | Result |
|---|---|---|---|
| hibiscus on indigo-900 (never) | `#C2185B` on `#10132B` | 3.11:1 | FAIL |
| brass on indigo-900 (never) | `#866711` on `#10132B` | 3.44:1 | FAIL |
| hibiscus-lift on oyster (never) | `#FF5C8A` on `#F1F0EC` | 2.58:1 | FAIL |
| brass-lift on oyster (never) | `#E8C36A` on `#F1F0EC` | 1.48:1 | FAIL |

Use `--hibiscus` / `--brass` on oyster, and `--hibiscus-lift` / `--brass-lift`
on indigo. The semantic tokens `--accent-ink` and `--wholesale-ink` already
switch for you; components should use those rather than the raw colours.

## Two deviations from the spec's stated numbers

The spec quotes `--brass` on `--oyster` at 5.2:1. Measured, `#8A6A12` on
`#F1F0EC` is **4.44:1** — a fail. Brass was darkened to `#866711`, which
measures 4.65:1 and keeps its character. Brass appears on card surfaces more
often than on the page, where it was already comfortable at 5.30:1.

Form control borders needed their own token. The card/divider border
(`#D6D3CA` light, `--indigo-700` dark) is decorative and sits at ~1.5:1, which
is fine for a separator but not for the boundary of an input a customer has to
find. `--input` is therefore darker than `--border` in both themes and clears
3:1 against both the card and the page.

## Colour is never the only signal

Verified in the components, not just in the palette:

- Sold-out sizes and colours carry a strike-through, `aria-disabled`, and the
  word "Sold out" in the accessible name.
- Wholesale prices carry the word "wholesale" and the threshold in words
  ("Wholesale from 6 pieces"), never brass alone.
- The tier meter states its status in a sentence in an `aria-live` region.
- Stock states say "In stock", "Only 3 left" or "Sold out" in text.
