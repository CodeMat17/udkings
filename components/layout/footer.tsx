import Link from "next/link";
import Image from "next/image";
import { MapPinIcon, PhoneIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { BUSINESS, waLink } from "@/lib/business";
import { getCategories } from "@/lib/catalog";

const HELP = [
  { href: "/delivery", label: "Delivery information" },
  { href: "/track", label: "Track your order" },
  { href: "/faq", label: "Frequently asked questions" },
  { href: "/contact", label: "Contact the shop" },
  { href: "/about", label: "About UDKING'S" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of sale" },
];

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/logo.webp"
            alt={BUSINESS.name}
            width={83}
            height={64}
            loading="lazy"
            className="h-16 w-auto"
          />
          <p className="mt-3 max-w-[38ch] text-sm text-muted-foreground">
            {BUSINESS.tagline} Retail and wholesale from the same catalogue,
            since the day we opened on Breadfruit Street.
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden="true" />
              <span>
                {BUSINESS.address.street}, {BUSINESS.address.locality},{" "}
                {BUSINESS.address.region}
              </span>
            </li>
            <li className="flex gap-3">
              <PhoneIcon className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden="true" />
              <a href={BUSINESS.telHref} className="hover:underline">
                {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-3">
              <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-stock" aria-hidden="true" />
              <a
                href={waLink(`Hello ${BUSINESS.name}, I would like to ask about an item.`)}
                target="_blank"
                rel="noopener"
                className="hover:underline"
              >
                Order on WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Shop by category">
          <h2 className="label text-muted-foreground">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} className="hover:underline">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help and information">
          <h2 className="label text-muted-foreground">Help</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {HELP.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="label text-muted-foreground">Opening hours</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {BUSINESS.hours.map((slot) => (
              <li key={slot.days} className="flex justify-between gap-4">
                <span>{slot.days}</span>
                <span className="text-muted-foreground">
                  {slot.close ? `${slot.open} – ${slot.close}` : slot.open}
                </span>
              </li>
            ))}
          </ul>
          <h2 className="label mt-8 text-muted-foreground">Legal</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="shell border-t border-border py-6 text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {BUSINESS.name}. Lagos Island, Nigeria.
        </p>
      </div>
    </footer>
  );
}
