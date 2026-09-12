import type { Metadata } from "next";
import { ArrowUpRightIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { PageIntro } from "@/components/layout/page-intro";
import { BUSINESS, waLink } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact UDKING'S Collections",
  description:
    "Reach UDKING'S Collections on WhatsApp or by phone, or come to Shop BF04, Andora Plaza, Breadfruit Street, Lagos Island. We answer during shop hours.",
  alternates: { canonical: "/contact" },
};

const CARD =
  "group flex items-center gap-5 rounded-lg border border-border bg-card p-6 transition-colors hover:border-foreground";

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Talk to us" title="Contact">
        WhatsApp is fastest — orders, stock questions and delivery all happen
        there. We answer during shop hours.
      </PageIntro>
      <ul className="shell grid max-w-4xl gap-4 md:grid-cols-2 lg:mx-0">
        <li className="md:col-span-2">
          <a
            href={waLink(`Hello ${BUSINESS.name}, I have a question.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={CARD}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-whatsapp text-white">
              <WhatsAppIcon className="size-5" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">WhatsApp {BUSINESS.phoneDisplay}</span>
              <span className="block text-sm text-muted-foreground">Opens WhatsApp in a new tab</span>
            </span>
            <ArrowUpRightIcon className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </li>
        <li>
          <a href={BUSINESS.telHref} className={CARD}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary">
              <PhoneIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold">Call {BUSINESS.phoneDisplay}</span>
              <span className="block text-sm text-muted-foreground">Best if you are on your way</span>
            </span>
          </a>
        </li>
        <li className="flex items-center gap-5 rounded-lg border border-border bg-card p-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary">
            <MapPinIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-semibold">{BUSINESS.address.street}</span>
            <span className="block text-sm text-muted-foreground">
              {BUSINESS.address.landmark}, {BUSINESS.address.locality}
            </span>
          </span>
        </li>
      </ul>
    </>
  );
}
