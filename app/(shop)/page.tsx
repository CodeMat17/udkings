import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRightIcon, ClockIcon, MapPinIcon, StoreIcon, TruckIcon, TagIcon } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { CategoryTabs } from "@/components/shop/category-tabs";
import { ProductGrid } from "@/components/shop/product-grid";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { LocalBusinessJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { getCategories, getProducts } from "@/lib/catalog";
import { toCardData } from "@/lib/card-data";
import { BUSINESS, waLink } from "@/lib/business";

/** Static; regenerated when the admin edits the catalogue (see lib/catalog.ts). */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "UDKING'S Collections — Ladies Wear, Lagos Island",
  description:
    "Ladies' gowns, jeans, tops, skirts and two-piece sets from Andora Plaza, Lagos Island. Retail and wholesale from one catalogue, ordered on WhatsApp.",
  alternates: { canonical: "/" },
};

const PROMISES = [
  { Icon: TagIcon, title: "Mix and match", body: "Order as many pieces as you like" },
  { Icon: WhatsAppIcon, title: "Order on WhatsApp", body: "Send your bag in one tap" },
  { Icon: StoreIcon, title: "Free pickup", body: "Andora Plaza, Lagos Island" },
  { Icon: TruckIcon, title: "Nationwide delivery", body: "Fee agreed before you pay" },
];

const STEPS = [
  {
    title: "Choose your pieces",
    body: "Pick sizes and quantities, and add as many pieces to your bag as you like.",
  },
  {
    title: "Send your bag on WhatsApp",
    body: "One tap writes the whole order out for you. No account, no forms, no payment here.",
  },
  {
    title: "We confirm, you receive",
    body: "We check availability, agree the total and delivery with you, then pack it for pickup or dispatch.",
  },
];

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const allProducts = products.map(toCardData);

  return (
    <>
      <LocalBusinessJsonLd />
      <WebSiteJsonLd />
      <Hero image="/catalogue/hero-home.jpg" />

      <section aria-label="Why shop with us" className="border-b border-border">
        <ul className="shell grid grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4">
          {PROMISES.map(({ Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="reveal shell mt-20 sm:mt-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="label text-muted-foreground">The collections</p>
            <h2 className="display mt-3 text-[length:var(--text-display-m)]">Shop by category</h2>
          </div>
          <Link href="/shop" className="link-underline inline-flex shrink-0 items-center gap-1.5 text-sm font-medium">
            Shop all
            <ArrowRightIcon className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
        <CategoryTabs categories={categories} className="mt-8" />
      </section>

      <section className="reveal shell mt-20 sm:mt-28">
        <div>
          <p className="label text-muted-foreground">The full catalogue</p>
          <h2 className="display mt-3 text-[length:var(--text-display-m)]">All products</h2>
        </div>
        <div className="mt-8">
          <ProductGrid products={allProducts} />
        </div>
      </section>

      <section className="reveal shell mt-20 sm:mt-28">
        <div className="max-w-2xl">
          <p className="label text-muted-foreground">No checkout, no fuss</p>
          <h2 className="display mt-3 text-[length:var(--text-display-m)]">How ordering works</h2>
        </div>
        <ol className="mt-10 grid gap-10 border-t border-border pt-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="display text-5xl text-muted-foreground/60">0{index + 1}</span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-[38ch] text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="reveal shell mt-20 sm:mt-28">
        <div className="grid gap-10 rounded-lg bg-[#17130f] p-8 text-[#f2ede6] sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16 dark:border dark:border-border dark:bg-card">
          <div>
            <p className="label text-[#f2ede6]/60">Visit the shop</p>
            <h2 className="display mt-4 text-[length:var(--text-display-m)]">
              Come and try it on
            </h2>
            <p className="mt-5 max-w-[46ch] text-[#f2ede6]/70">
              Shop BF04, Andora Plaza on Breadfruit Street — by St. Paul Anglican
              Church, Lagos Island. Walk in, meet the people you&rsquo;re buying
              from, and carry it home the same day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/visit-us" className="btn bg-[#f2ede6] text-[#17130f] hover:opacity-90">
                Directions
              </Link>
              <a
                href={waLink(`Hello ${BUSINESS.shortName}, I would like to ask about your ladies' wear.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-[#f2ede6]/40 hover:bg-white/10"
              >
                <WhatsAppIcon className="size-4" aria-hidden="true" />
                Chat with us
              </a>
            </div>
          </div>
          <dl className="grid content-center gap-6 text-sm">
            <div className="flex gap-4">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-[#f2ede6]/60" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <dt className="font-semibold">Address</dt>
                <dd className="mt-1 text-[#f2ede6]/70">
                  {BUSINESS.address.street}, {BUSINESS.address.locality}
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <ClockIcon className="mt-0.5 size-5 shrink-0 text-[#f2ede6]/60" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <dt className="font-semibold">Opening hours</dt>
                {BUSINESS.hours.map((slot) => (
                  <dd key={slot.days} className="mt-1 text-[#f2ede6]/70">
                    {slot.days}: {slot.close ? `${slot.open}–${slot.close}` : slot.open}
                  </dd>
                ))}
              </div>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
