import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { BagContents } from "@/components/bag/bag-contents";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false, follow: true },
};

/** A static shell; the bag itself lives in the browser. */
export default function CartPage() {
  return (
    <>
      <PageIntro eyebrow="Ready to order" title="Your bag">
        Send the list to us on WhatsApp — we confirm availability and the total
        price in the chat.
      </PageIntro>
      <div className="shell">
        <BagContents variant="page" />
      </div>
    </>
  );
}
