import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRightIcon, MapPinIcon, TruckIcon, WalletIcon } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { Rail } from "@/components/home/rail";
import { Reveal } from "@/components/motion/reveal";
import { LocalBusinessJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { getCategories, getProducts } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "UDKING'S Collections — Ladies Wear, Lagos Island",
  description:
    "Ladies jeans, tops, gowns, skirts and two-piece sets from Andora Plaza, Lagos Island. Retail and wholesale from one catalogue, ordered on WhatsApp.",
  alternates: { canonical: "/" },
};

const PROMISES = [
  {
    Icon: WalletIcon,
    title: "Wholesale price, stated plainly",
    body: "Every product page shows the quantity the wholesale price starts at, in words. No hidden table, no negotiation to find out.",
  },
  {
    Icon: MapPinIcon,
    title: "Pick up on Breadfruit Street",
    body: `${BUSINESS.address.street}. Come in, try it, carry it home the same day.`,
  },
  {
    Icon: TruckIcon,
    title: "Delivery across Nigeria",
    body: "The delivery page lists what each zone usually costs. The shop sets the fee for your order and tells you on WhatsApp before you pay — we never invent a number.",
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

      <Reveal as="section" className="shell mt-14">
        <h2 className="sr-only">Why buy from UDKING&rsquo;S</h2>
        <ul className="grid gap-6 sm:grid-cols-3">
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

      <Rail title="New in" eyebrow="Just landed" href="/shop/new" products={newIn} />
      <Rail
        title="Best sellers"
        eyebrow="What Lagos is buying"
        href="/shop/best-sellers"
        products={bestSellers}
      />

      <Reveal as="section" className="shell mt-20">
        <p className="label text-accent-ink">Shop by rail</p>
        <h2 className="display mt-2 text-[length:var(--text-display-m)]">
          Eight categories, one catalogue
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <li key={category.slug}>
              <Reveal index={index}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative block aspect-[3/2] overflow-hidden rounded-md"
                >
                  <Image
                    src={category.heroImage}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 300px"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="scrim absolute inset-0" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4 text-white">
                    <span className="text-lg font-extrabold">{category.name}</span>
                    <ArrowRightIcon className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Reveal>

      <Rail
        title="Wholesale lines"
        eyebrow="For traders and boutiques"
        href="/shop?wholesale=1"
        products={wholesale}
      />

      <Reveal as="section" className="shell mt-20">
        <div className="rounded-lg border border-border bg-card p-8 sm:p-12">
          <p className="label text-wholesale">Buying stock</p>
          <h2 className="display mt-3 max-w-[18ch] text-[length:var(--text-display-m)]">
            Traders get the ladder, not a favour
          </h2>
          <p className="mt-4 max-w-[60ch] text-muted-foreground">
            Set a quantity and the price moves down the tiers in front of you.
            Mix sizes across one style and the ladder still counts the total.
            Ask for the full wholesale catalogue and we send it on WhatsApp.
          </p>
          <Link
            href="/shop?wholesale=1"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 font-extrabold text-primary-foreground"
          >
            See the wholesale lines
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </>
  );
}
