import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { BUSINESS, waLink } from "@/lib/business";
import { getCategories } from "@/lib/catalog";

const HELP = [
  { href: "/faq", label: "How ordering works" },
  { href: "/visit-us", label: "Visit the shop" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "Our story" },
];

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="mt-28 bg-[#17130f] text-[#f2ede6] dark:border-t dark:border-border dark:bg-card">
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="display text-4xl">
              UDKING&rsquo;S <em>Collections</em>
            </p>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-[#f2ede6]/65">
              {BUSINESS.tagline} Browse here, send your bag on WhatsApp, and we
              take it from there.
            </p>
            <a
              href={waLink(`Hello ${BUSINESS.name}, I would like to ask about an item.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-7 h-11 bg-[#f2ede6] px-5 text-sm text-[#17130f] hover:opacity-90"
            >
              <WhatsAppIcon className="size-4" aria-hidden="true" />
              Chat with us
            </a>
          </div>

          <nav aria-label="Shop">
            <h2 className="label text-[#f2ede6]/50">Shop</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/shop/best-sellers" className="link-underline">Best sellers</Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`} className="link-underline">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <h2 className="label text-[#f2ede6]/50">Help</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {HELP.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="label text-[#f2ede6]/50">Visit</h2>
            <address className="mt-5 text-sm leading-relaxed not-italic">
              {BUSINESS.address.street}
              <br />
              {BUSINESS.address.landmark}, {BUSINESS.address.locality}
            </address>
            <a href={BUSINESS.telHref} className="link-underline mt-3 inline-block text-sm">
              {BUSINESS.phoneDisplay}
            </a>
            <ul className="mt-5 space-y-1.5 text-sm text-[#f2ede6]/65">
              {BUSINESS.hours.map((slot) => (
                <li key={slot.days} className="flex justify-between gap-4">
                  <span>{slot.days}</span>
                  <span>{slot.close ? `${slot.open}–${slot.close}` : slot.open}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[#f2ede6]/15 pt-8 text-xs text-[#f2ede6]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {BUSINESS.name}. Lagos Island, Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
}
