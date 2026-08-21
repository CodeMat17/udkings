import type { Metadata } from "next";
import { ClockIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { BUSINESS, waLink } from "@/lib/business";

export const metadata: Metadata = {
  title: "Visit the shop on Breadfruit Street",
  description:
    "UDKING'S Collections is at Shop BF04, Andora Plaza, by St. Paul Anglican Church, Breadfruit Street, Lagos Island. Opening hours, directions and pickup instructions.",
  alternates: { canonical: "/visit-us" },
};

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Andora Plaza, Breadfruit Street, Lagos Island, Lagos",
)}`;

const { lat, lng } = BUSINESS.address.geo;
const SPAN = 0.004;
const OSM_EMBED = `https://www.openstreetmap.org/export/embed.html?bbox=${
  lng - SPAN
}%2C${lat - SPAN}%2C${lng + SPAN}%2C${lat + SPAN}&layer=mapnik&marker=${lat}%2C${lng}`;

export default function VisitUsPage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <div className="shell py-10">
        <p className="label text-accent-ink">Come to the shop</p>
        <h1 className="display mt-2 text-[length:var(--text-display-l)]">
          Shop BF04, Andora Plaza
        </h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <MapPinIcon className="mt-1 size-5 shrink-0 text-accent-ink" aria-hidden="true" />
                <div>
                  <h2 className="font-extrabold">Address</h2>
                  <p className="mt-1 text-muted-foreground">
                    {BUSINESS.address.street}
                    <br />
                    {BUSINESS.address.landmark}
                    <br />
                    {BUSINESS.address.locality}, {BUSINESS.address.region}
                  </p>
                  <a
                    href={MAPS}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 inline-block font-bold hover:underline"
                  >
                    Open in Google Maps, in a new tab
                  </a>
                </div>
              </li>

              <li className="flex gap-4">
                <ClockIcon className="mt-1 size-5 shrink-0 text-accent-ink" aria-hidden="true" />
                <div>
                  <h2 className="font-extrabold">Opening hours</h2>
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

              <li className="flex gap-4">
                <PhoneIcon className="mt-1 size-5 shrink-0 text-accent-ink" aria-hidden="true" />
                <div>
                  <h2 className="font-extrabold">Call before you set out</h2>
                  <p className="mt-1 text-muted-foreground">
                    Breadfruit Street is busy at midday. Call and we will hold
                    your size at the counter.
                  </p>
                  <a href={BUSINESS.telHref} className="mt-2 inline-block font-bold hover:underline">
                    {BUSINESS.phoneDisplay}
                  </a>
                </div>
              </li>

              <li className="flex gap-4">
                <MessageCircleIcon className="mt-1 size-5 shrink-0 text-stock" aria-hidden="true" />
                <div>
                  <h2 className="font-extrabold">Collecting an order</h2>
                  <p className="mt-1 text-muted-foreground">
                    Bring your order number, or show us the WhatsApp message. We
                    keep pickup orders for three days.
                  </p>
                  <a
                    href={waLink(
                      `Hello ${BUSINESS.name}, I am coming to collect an order.`,
                    )}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 inline-block font-bold hover:underline"
                  >
                    Tell us you are coming, on WhatsApp
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* OpenStreetMap embed — no Google Maps JS, no API key on this route. */}
          <div className="overflow-hidden rounded-md border border-border">
            <iframe
              src={OSM_EMBED}
              title="Map of Andora Plaza, Breadfruit Street, Lagos Island"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block aspect-[4/3] w-full border-0"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card p-5">
              <div>
                <span className="label block text-muted-foreground">
                  Breadfruit Street, Lagos Island
                </span>
                <span className="mt-1 block text-lg font-extrabold">
                  {BUSINESS.address.street}
                </span>
              </div>
              <a
                href={MAPS}
                target="_blank"
                rel="noopener"
                className="font-bold hover:underline"
              >
                Open the map for directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
