import Link from "next/link";
import { ArrowRightIcon, MapPinIcon, PackageIcon, TagIcon } from "lucide-react";
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel";
import { getProducts } from "@/lib/catalog";
import { unitPriceFor } from "@/lib/pricing";
import { formatNaira } from "@/lib/format";

const LINES = ["Lagos Island", "dresses", "the whole city"];

/** The fold rotation: one piece from each side of the range, in this order. */
const FEATURED: { slug: string; eyebrow: string }[] = [
  { slug: "oversized-denim-jacket", eyebrow: "The jacket" },
  { slug: "raw-indigo-high-waist-straight-jeans", eyebrow: "The jeans" },
  { slug: "satin-cowl-neck-maxi-gown", eyebrow: "The gown" },
  { slug: "thick-bump-shorts", eyebrow: "The bump shorts" },
  { slug: "ribbed-two-piece-lounge-set", eyebrow: "The two-piece" },
];

/** The three things a first-time buyer wants answered before they scroll. */
const PROOF: { icon: typeof TagIcon; label: string }[] = [
  { icon: TagIcon, label: "Wholesale price on every product page" },
  { icon: PackageIcon, label: "Buy one piece or buy a dozen" },
  { icon: MapPinIcon, label: "Shop BF04, Andora Plaza" },
];

async function buildSlides(): Promise<HeroSlide[]> {
  const products = await getProducts();
  return FEATURED.flatMap(({ slug, eyebrow }) => {
    const product = products.find((p) => p.slug === slug);
    if (!product) return [];
    const minQty = product.wholesaleMinQty;
    return [
      {
        slug: product.slug,
        name: product.name,
        eyebrow,
        image: product.image.src,
        imageAlt: product.image.alt,
        price: formatNaira(product.retailPrice),
        wholesale: minQty
          ? `${formatNaira(unitPriceFor(product, minQty).unitPrice)} at ${minQty}`
          : null,
      },
    ];
  });
}

/**
 * The page-load sequence: the headline lines rise in a 60ms stagger, once, on
 * first paint, and never again.
 *
 * This is a server component driving CSS keyframes rather than a client
 * animation library, for two reasons. The headline is the LCP element, and an
 * animation library renders it at opacity 0 in the server HTML — invisible
 * until hydration, on exactly the slow connections this site is built for.
 * And it keeps Framer off the home page entirely. Reduced motion is handled in
 * CSS: the sequence renders as its final frame.
 *
 * There is no background photograph. The ground is painted in CSS
 * (`.hero-ground` + `.hero-weave` + `.hero-bloom`), which costs zero bytes of
 * image, never fights the headline for contrast, and leaves the fold's single
 * photograph budget to the garment on the right — where it is actually
 * selling something.
 *
 * The right column is the rotation: a jacket, jeans, a gown, bump shorts, a
 * two-piece — each priced and linked. It is the fastest answer to "what do
 * you actually sell?". Below `lg` it stacks under the CTAs rather than
 * competing with the headline.
 */
export async function Hero() {
  const slides = await buildSlides();

  return (
    <section className="hero-ground relative isolate min-h-[80svh] overflow-hidden text-white">
      {/* Painted ground: weave, bloom, and a hairline foot. */}
      <div className="hero-weave absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="hero-bloom hero-breathe absolute -top-24 -left-32 -z-10 size-[42rem] rounded-full"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        aria-hidden="true"
      />

      <div className="shell grid min-h-[80svh] items-center gap-12 pt-28 pb-20 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <div className="flex flex-col justify-center">
          <p
            className="hero-line inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pr-4 pl-3 backdrop-blur-sm"
            style={{ animationDelay: "90ms" }}
          >
            <span
              className="size-1.5 rounded-full bg-[var(--hibiscus-lift)]"
              aria-hidden="true"
            />
            <span className="label text-[var(--brass-lift)]">
              Retail &amp; wholesale &middot; Breadfruit Street
            </span>
          </p>

          <h1 className="display mt-6 max-w-[13ch] text-[length:var(--text-display-xl)] text-balance">
            {LINES.map((line, index) => (
              <span
                key={line}
                className="hero-line block"
                style={{ animationDelay: `${150 + index * 60}ms` }}
              >
                {index === 1 ? (
                  <span className="relative inline-block text-[var(--hibiscus-lift)]">
                    {line}
                    <span
                      className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[var(--hibiscus-lift)] to-transparent"
                      aria-hidden="true"
                    />
                  </span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p
            className="hero-line mt-8 max-w-[46ch] text-lg leading-relaxed text-white/80"
            style={{ animationDelay: "330ms" }}
          >
            Jeans, tops, gowns and two-piece sets from Shop BF04, Andora Plaza.
            Buy one piece or buy a dozen &mdash; the wholesale price is on every
            product page, in words.
          </p>

          <div
            className="hero-line mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "390ms" }}
          >
            <Link
              href="/shop"
              className="group inline-flex h-13 items-center gap-2 rounded-md bg-[var(--hibiscus-lift)] px-7 font-extrabold text-[var(--indigo-900)] shadow-[0_18px_40px_-16px_rgb(255_92_138/0.85)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Shop the catalogue
              <ArrowRightIcon
                className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/shop?wholesale=1"
              className="inline-flex h-13 items-center gap-2 rounded-md border border-white/35 px-7 font-extrabold text-white transition-colors duration-200 hover:border-[var(--brass-lift)] hover:text-[var(--brass-lift)] motion-reduce:transition-none"
            >
              Buying wholesale?
            </Link>
          </div>

          <ul
            className="hero-line mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/70"
            style={{ animationDelay: "450ms" }}
          >
            {PROOF.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon
                  className="size-4 shrink-0 text-[var(--brass-lift)]"
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <HeroCarousel slides={slides} />
      </div>
    </section>
  );
}
