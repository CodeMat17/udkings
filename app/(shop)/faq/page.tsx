import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "How ordering works — FAQ",
  description:
    "How to order on WhatsApp, how wholesale pricing works, mixing sizes, delivery, pickup and exchanges at UDKING'S Collections, Lagos Island.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Add pieces to your bag, then tap “Send order on WhatsApp”. Your list arrives in our chat already written out. We confirm availability and the total price, then agree payment and delivery or pickup with you there.",
  },
  {
    q: "Do I pay on the website?",
    a: "No. There is no checkout and no card form on this site. Payment details are shared on WhatsApp, only after we have confirmed your pieces are available.",
  },
  {
    q: "How does the wholesale price work?",
    a: "Every product shows the quantity where wholesale starts and the price at each step. Add that many pieces and the price drops as you count up — no separate price list, no negotiation to find out the number.",
  },
  {
    q: "Can I mix sizes in a wholesale order?",
    a: "Yes, within one style. The price ladder counts the total pieces of that style, not the pieces per size. Tell us the size breakdown in the chat and we confirm it before payment.",
  },
  {
    q: "How much is delivery?",
    a: "We deliver anywhere in Nigeria. The fee depends on your address and what you ordered, so we agree it with you on WhatsApp before dispatch and before you pay.",
  },
  {
    q: "Can I collect instead?",
    a: "Yes, and it is free. Collect from Shop BF04, Andora Plaza on Breadfruit Street, Lagos Island — just show us your WhatsApp chat.",
  },
  {
    q: "What if the size does not fit?",
    a: "Bring it back to the shop within three days, unworn and with its tags, and we will exchange it for another size or another piece of the same value.",
  },
  {
    q: "Are the sizes on a product available?",
    a: "We only list sizes we stock. Pieces sell quickly, so we confirm your size in the reply before anything is paid for.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageIntro eyebrow="Questions & answers" title="How ordering works" />
      <div className="shell max-w-3xl divide-y divide-border border-y border-border lg:mx-0">
        {FAQS.map((item, index) => (
          <details key={item.q} className="group" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium">
              {item.q}
              <PlusIcon
                className="size-5 shrink-0 transition-transform duration-300 group-open:rotate-45"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </summary>
            <p className="max-w-[62ch] pb-7 leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
