import type { Metadata } from "next";
import { ClockIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { PageIntro } from "@/components/layout/page-intro";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { BUSINESS, waLink } from "@/lib/business";

export const metadata: Metadata = {
  title: "Visit the shop on Breadfruit Street",
  description:
    "UDKING'S Collections is at Shop BF04, Andora Plaza, by St. Paul Anglican Church, Breadfruit Street, Lagos Island. Opening hours, directions and pickup.",
  alternates: { canonical: "/visit-us" },
};

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Andora Plaza, Breadfruit Street, Lagos Island, Lagos",
)}`;

const { lat, lng } = BUSINESS.address.geo;
const SPAN = 0.004;
const OSM_EMBED = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - SPAN}%2C${
  lat - SPAN
}%2C${lng + SPAN}%2C${lat + SPAN}&layer=mapnik&marker=${lat}%2C${lng}`;

export default function VisitUsPage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <PageIntro eyebrow="Come to the shop" title="Shop BF04, Andora Plaza" />

      <div className="shell grid gap-12 lg:grid-cols-2">
        <ul className="space-y-8">
          <li className="flex gap-5">
            <MapPinIcon className="mt-1 size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Address</h2>
              <p className="mt-1 text-muted-foreground">
                {BUSINESS.address.street}
                <br />
                {BUSINESS.address.landmark}
                <br />
                {BUSINESS.address.locality}, {BUSINESS.address.region}
              </p>
              <a href={MAPS} target="_blank" rel="noopener noreferrer" className="link-underline mt-2 inline-block text-sm font-medium">
                Open in Google Maps
              </a>
            </div>
          </li>
          <li className="flex gap-5">
            <ClockIcon className="mt-1 size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Opening hours</h2>
              <dl className="mt-1 space-y-1 text-muted-foreground">
                {BUSINESS.hours.map((slot) => (
                  <div key={slot.days} className="flex gap-3">
                    <dt className="w-40">{slot.days}</dt>
                    <dd>{slot.close ? `${slot.open} – ${slot.close}` : slot.open}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
          <li className="flex gap-5">
            <PhoneIcon className="mt-1 size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Call before you set out</h2>
              <p className="mt-1 text-muted-foreground">
                Breadfruit Street is busy at midday. Call and we will hold your
                size at the counter.
              </p>
              <a href={BUSINESS.telHref} className="link-underline mt-2 inline-block text-sm font-medium">
                {BUSINESS.phoneDisplay}
              </a>
            </div>
          </li>
          <li className="flex gap-5">
            <WhatsAppIcon className="mt-1 size-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Collecting an order</h2>
              <p className="mt-1 text-muted-foreground">
                Show us your WhatsApp chat at the counter. Tell us you are on
                your way and we will have it packed.
              </p>
              <a
                href={waLink(`Hello ${BUSINESS.name}, I am coming to collect my order.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-2 inline-block text-sm font-medium"
              >
                Tell us you are coming
              </a>
            </div>
          </li>
        </ul>

        {/* OpenStreetMap embed — no Google Maps JS, no API key. */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <iframe
            src={OSM_EMBED}
            title="Map of Andora Plaza, Breadfruit Street, Lagos Island"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block aspect-[4/3] w-full border-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <span className="text-sm font-medium">{BUSINESS.address.street}</span>
            <a href={MAPS} target="_blank" rel="noopener noreferrer" className="btn btn-primary h-10 px-5 text-sm">
              Get directions
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
