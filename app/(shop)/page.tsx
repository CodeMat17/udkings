import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StoreIcon,
  TruckIcon,
  WalletIcon,
} from "lucide-react";
import { Hero } from "@/components/home/hero";
import { Rail } from "@/components/home/rail";
import { Reveal } from "@/components/motion/reveal";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { LocalBusinessJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { getCategories, getProducts } from "@/lib/catalog";
import { BUSINESS, waLink } from "@/lib/business";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "UDKING'S Collections — Ladies Wear, Lagos Island",
  description:
    "Ladies jeans, tops, gowns, skirts and two-piece sets from Andora Plaza, Lagos Island. Retail and wholesale from one catalogue, ordered on WhatsApp.",
  alternates: { canonical: "/" },
};

/** Why shop here — kept below the products, where a customer looks for it. */
const PROMISES = [
  {
    Icon: ShieldCheckIcon,
    title: "Quality you can hold",
    body: "Every piece is one we would sell over the counter on Breadfruit Street. If it would not pass in the shop, it is not in the catalogue.",
  },
  {
    Icon: WalletIcon,
    title: "Wholesale price, stated plainly",
    body: "Every product page shows the quantity the wholesale price starts at, in words. No hidden table, no negotiation to find out.",
  },
  {
    Icon: StoreIcon,
    title: "Pick up on Breadfruit Street",
    body: `${BUSINESS.address.street}. Come in, try it, carry it home the same day.`,
  },
  {
    Icon: TruckIcon,
    title: "Delivery across Nigeria",
    body: "The delivery page lists what each zone usually costs. The shop confirms your fee on WhatsApp before you pay — we never invent a number.",
  },
  {
    Icon: WhatsAppIcon,
    title: "Easy WhatsApp ordering",
    body: "Build the order here, we give it a number, and the rest happens in a chat. Nothing is charged before somebody confirms your size is in stock.",
  },
  {
    Icon: MapPinIcon,
    title: "A real shop, not a page",
    body: `${BUSINESS.address.landmark}, ${BUSINESS.address.locality}. Walk in and meet the people you are buying from.`,
  },
];

export default async function HomePage() {
  const [categories, PRODUCTS] = await Promise.all([getCategories(), getProducts()]);
  const newIn = PRODUCTS.filter((p) => p.isNewArrival).slice(0, 8);
  const bestSellers = [...PRODUCTS]
    .filter((p) => p.isBestSeller)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 8);
  const wholesale = PRODUCTS.filter((p) => p.wholesaleMinQty !== null).slice(0, 8);

  return (
    <>
      <LocalBusinessJsonLd />
      <WebSiteJsonLd />
      <Hero />

      {/* Categories first: the fastest route from "show me what you sell" to a
          product grid, and short enough to peek above the fold. */}
      <Reveal as="section" className="shell mt-10">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-[length:var(--text-display-m)]">
            Shop by category
          </h2>
          <Link
            href="/categories"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 font-bold whitespace-nowrap hover:underline"
          >
            All categories
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((category, index) => (
            <li key={category.slug}>
              <Reveal index={index}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative block aspect-3/2 overflow-hidden rounded-md"
                >
                  <Image
                    src={category.heroImage}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 300px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="scrim absolute inset-0" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 text-white sm:p-4">
                    <span className="font-extrabold sm:text-lg">{category.name}</span>
                    <ArrowRightIcon className="size-4 shrink-0" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Reveal>

      <Rail title="New arrivals" eyebrow="Just landed" href="/shop/new" products={newIn} />
      <Rail
        title="Best sellers"
        eyebrow="What Lagos is buying"
        href="/shop/best-sellers"
        products={bestSellers}
      />

      <Reveal as="section" className="shell mt-16">
        <div className="rounded-lg border border-border bg-card p-8 sm:p-12">
          <p className="label text-wholesale">Wholesale</p>
          <h2 className="display mt-3 max-w-[18ch] text-[length:var(--text-display-m)]">
            Traders get the ladder, not a favour
          </h2>
          <p className="mt-4 max-w-[60ch] text-muted-foreground">
            Set a quantity and the price moves down the tiers in front of you.
            Mix sizes across one style and the ladder still counts the total.
            Bulk pricing, the same quality that sells over the counter, and
            pickup on Lagos Island.
          </p>
          <Link
            href="/shop?wholesale=1"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 font-extrabold text-primary-foreground"
          >
            Shop wholesale
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>

      <Rail
        title="Wholesale lines"
        eyebrow="For traders and boutiques"
        href="/shop?wholesale=1"
        products={wholesale}
      />

      <Reveal as="section" className="shell mt-20">
        <p className="label text-accent-ink">Why UDKING&rsquo;S</p>
        <h2 className="display mt-2 text-[length:var(--text-display-m)]">
          What you get, every order
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map(({ Icon, title, body }, index) => (
            <li key={title}>
              <Reveal index={index}>
                <Icon className="size-6 text-accent-ink" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-extrabold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" className="shell mt-20">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-8">
            <MapPinIcon className="size-6 text-accent-ink" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-extrabold">Visit the shop</h2>
            <p className="mt-3 text-muted-foreground">
              {BUSINESS.address.street}
              <br />
              {BUSINESS.address.landmark}, {BUSINESS.address.locality}
            </p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {BUSINESS.hours.map((slot) => (
                <li key={slot.days} className="flex items-center gap-2">
                  <ClockIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span>
                    {slot.days}: {slot.close ? `${slot.open} – ${slot.close}` : slot.open}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/visit-us"
              className="mt-5 inline-flex h-11 items-center gap-1.5 font-bold hover:underline"
            >
              Directions and parking
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-card p-8">
            <TruckIcon className="size-6 text-accent-ink" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-extrabold">Delivery nationwide</h2>
            <p className="mt-3 text-muted-foreground">
              Lagos, the South East, the North — the delivery page lists what
              each zone usually costs so you can budget before you order. The
              shop confirms the exact fee for your parcel on WhatsApp.
            </p>
            <Link
              href="/delivery"
              className="mt-5 inline-flex h-11 items-center gap-1.5 font-bold hover:underline"
            >
              See delivery zones
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="shell mt-16">
        <div className="flex flex-col items-start gap-5 rounded-lg border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl font-extrabold">Ask us on WhatsApp</h2>
            <p className="mt-2 max-w-[52ch] text-muted-foreground">
              Sizes, stock, bulk prices or a photograph of something you saw —
              message the shop directly on {BUSINESS.phoneDisplay}.
            </p>
          </div>
          <a
            href={waLink(
              `Hello ${BUSINESS.shortName}, I would like to ask about your ladies' wear.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-primary px-6 font-extrabold text-primary-foreground"
          >
            <WhatsAppIcon className="size-5" aria-hidden="true" />
            Chat with us
          </a>
        </div>
      </Reveal>

      <Reveal as="section" className="shell mt-16 mb-4 max-w-[68ch]">
        <p className="label text-accent-ink">About UDKING&rsquo;S</p>
        <h2 className="display mt-2 text-[length:var(--text-display-m)]">
          A shop on Breadfruit Street
        </h2>
        <p className="mt-4 text-muted-foreground">
          {BUSINESS.name} sells ladies&rsquo; fashion from Shop BF04 in Andora
          Plaza, Lagos Island. Two kinds of customer walk in: a woman buying
          something she likes, and a trader restocking. They get the same
          catalogue and the same honesty about price — which is exactly what
          this website is.
        </p>
        <Link
          href="/about"
          className="mt-5 inline-flex h-11 items-center gap-1.5 font-bold hover:underline"
        >
          Read our story
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </Reveal>
    </>
  );
}
