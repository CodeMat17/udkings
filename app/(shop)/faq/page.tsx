import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "How wholesale pricing works, whether sizes can be mixed, delivery fees, pickup, returns and payment at UDKING'S Collections, Lagos Island.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "How does the wholesale price work?",
    a: "Every product page shows the quantity the wholesale price starts at, written in words. Add that many pieces and the price on the page changes to the wholesale rate as you count up. There is no separate wholesale list and no negotiation needed to find out the number.",
  },
  {
    q: "Can I mix sizes and colours in a wholesale order?",
    a: "Yes, within one style. The ladder counts the total pieces of that style, not the pieces per size, and the pack builder on the wholesale page does the arithmetic. Tell us the colour and size breakdown you want on WhatsApp and we confirm it before payment.",
  },
  {
    q: "Do I pay on the website?",
    a: "No. You build the order here and it gets an order number. Payment details are confirmed on WhatsApp, where we also confirm the pieces before anything is paid for.",
  },
  {
    q: "How much is delivery?",
    a: "The delivery page lists what each zone usually costs, as a guide. The fee for your own order is set by the shop, not by the website: we look at your address and what you have ordered, then confirm the fee with you on WhatsApp before dispatch and before you pay. We never quote a number we cannot stand behind.",
  },
  {
    q: "Can I collect instead?",
    a: "Yes, and it is free. Choose pickup at checkout and collect from Shop BF04, Andora Plaza on Breadfruit Street. We hold pickup orders for three days.",
  },
  {
    q: "What if the size does not fit?",
    a: "Bring it back to the shop within three days, unworn and with its tags, and we will exchange it for another size or another piece of the same value.",
  },
  {
    q: "Are all the colours and sizes on a product available?",
    a: "Yes. We only list a colour or a size when we have it, so everything on a product page is something you can buy. You do not choose them on the site — tell us the colour and the size you want in the WhatsApp message, and we confirm it in the reply. If you want something that is not listed, ask there too; there is an 'Ask about this piece' button on every product.",
  },
  {
    q: "Are the colours in the photographs accurate?",
    a: "The photographs are shot on white and we never dim them, including in dark mode, because fabric colour is the purchase decision. Each piece has one photograph — if you want another angle or a shot in daylight, ask on WhatsApp and we will send it.",
  },
];

export default function FaqPage() {
  return (
    <div className="shell max-w-[68ch] py-10">
      <p className="label text-accent-ink">Answers</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        Frequently asked questions
      </h1>

      <dl className="mt-10 space-y-8">
        {FAQS.map((item) => (
          <div key={item.q}>
            <dt className="text-lg font-extrabold">{item.q}</dt>
            <dd className="mt-2 text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
