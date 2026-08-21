import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "About UDKING'S Collections",
  description:
    "UDKING'S Collections sells ladies' fashion retail and wholesale from Shop BF04, Andora Plaza, Breadfruit Street, Lagos Island. Here is how we work.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="shell max-w-[68ch] py-10">
      <p className="label text-accent-ink">Who we are</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        A shop on Breadfruit Street
      </h1>
      <p className="mt-6 text-lg">
        {BUSINESS.name} sells ladies&rsquo; fashion from Shop BF04 in Andora
        Plaza, by St. Paul Anglican Church on Lagos Island. Jeans, tops, gowns,
        skirts, bump shorts, jackets, trousers and two-piece sets — the same
        catalogue whether you are buying one piece for yourself or a dozen for
        your shop.
      </p>
      <p className="mt-5 text-muted-foreground">
        Two kinds of customer walk in here. A woman buying something she likes,
        and a trader restocking. They deserve the same catalogue and the same
        honesty about price, so that is what this website is: one catalogue,
        with the wholesale ladder written out on every product page instead of
        hidden behind a negotiation.
      </p>
      <p className="mt-5 text-muted-foreground">
        We do not take payment on the website. You build your order here, we
        give it a number, and the conversation continues on WhatsApp where we
        confirm stock, delivery and payment. That way nothing is charged before
        somebody has told you it is actually in your size.
      </p>
    </div>
  );
}
