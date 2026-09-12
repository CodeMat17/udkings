import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "About UDKING'S Collections",
  description:
    "UDKING'S Collections sells ladies' fashion retail and wholesale from Shop BF04, Andora Plaza, Breadfruit Street, Lagos Island. Here is how we work.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="Our story" title={<>A shop on <em>Breadfruit Street</em></>} />
      <div className="shell max-w-[68ch] space-y-6 text-lg leading-relaxed">
        <p>
          {BUSINESS.name} sells ladies&rsquo; fashion from Shop BF04 in Andora
          Plaza, by St. Paul Anglican Church on Lagos Island. Gowns, jeans, tops,
          skirts, bump shorts, jackets, trousers and two-piece sets — the same
          catalogue whether you are buying one piece for yourself or a dozen for
          your boutique.
        </p>
        <p className="text-muted-foreground">
          Two kinds of customer walk in here: a woman buying something she loves,
          and a trader restocking. They deserve the same collection and the same
          honesty about price, so that is what this website is — one catalogue,
          with the wholesale ladder written out on every product instead of
          hidden behind a negotiation.
        </p>
        <p className="text-muted-foreground">
          We don&rsquo;t take payment online. Fill your bag here, send it to us on
          WhatsApp, and we confirm availability, delivery and the total with you
          in the chat. Nothing is paid before a person has told you it is ready
          in your size.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/shop" className="btn btn-primary">Shop the collection</Link>
          <Link href="/visit-us" className="btn btn-outline">Visit the shop</Link>
        </div>
      </div>
    </>
  );
}
