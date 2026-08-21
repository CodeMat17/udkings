import type { Metadata } from "next";
import { MapPinIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { BUSINESS, waLink } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact UDKING'S Collections",
  description:
    "Reach UDKING'S Collections on WhatsApp or by phone, or come to Shop BF04, Andora Plaza, Breadfruit Street, Lagos Island. We answer during shop hours.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="shell max-w-[68ch] py-10">
      <p className="label text-accent-ink">Talk to us</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">Contact</h1>
      <p className="mt-4 text-muted-foreground">
        WhatsApp is fastest — it is where orders, stock questions and delivery
        arrangements all happen. We answer during shop hours.
      </p>

      <ul className="mt-8 space-y-4">
        <li>
          <a
            href={waLink(`Hello ${BUSINESS.name}, I have a question.`)}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-4 rounded-md border border-border bg-card p-5 hover:bg-accent"
          >
            <MessageCircleIcon className="size-6 shrink-0 text-stock" aria-hidden="true" />
            <span>
              <span className="block font-extrabold">
                WhatsApp {BUSINESS.phoneDisplay}
              </span>
              <span className="block text-sm text-muted-foreground">
                Opens WhatsApp in a new tab
              </span>
            </span>
          </a>
        </li>
        <li>
          <a
            href={BUSINESS.telHref}
            className="flex items-center gap-4 rounded-md border border-border bg-card p-5 hover:bg-accent"
          >
            <PhoneIcon className="size-6 shrink-0 text-accent-ink" aria-hidden="true" />
            <span>
              <span className="block font-extrabold">Call {BUSINESS.phoneDisplay}</span>
              <span className="block text-sm text-muted-foreground">
                Best if you are on your way to the shop
              </span>
            </span>
          </a>
        </li>
        <li className="flex items-center gap-4 rounded-md border border-border bg-card p-5">
          <MapPinIcon className="size-6 shrink-0 text-accent-ink" aria-hidden="true" />
          <span>
            <span className="block font-extrabold">{BUSINESS.address.street}</span>
            <span className="block text-sm text-muted-foreground">
              {BUSINESS.address.landmark}, {BUSINESS.address.locality},{" "}
              {BUSINESS.address.region}
            </span>
          </span>
        </li>
      </ul>
    </div>
  );
}
