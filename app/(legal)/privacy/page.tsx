import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What UDKING'S Collections collects when you place an order, why we collect it, how long we keep it, and how to ask us to delete it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="shell max-w-[68ch] py-10">
      <h1 className="display text-[length:var(--text-display-l)]">Privacy policy</h1>

      <h2 className="display mt-10 text-2xl">What we collect</h2>
      <p className="mt-3 text-muted-foreground">
        When you place an order we collect your name, phone number, WhatsApp
        number, and — for delivery orders — the address, landmark and any
        instructions you give the rider. That is all. There are no customer
        accounts and no passwords on this website.
      </p>

      <h2 className="display mt-8 text-2xl">Why we collect it</h2>
      <p className="mt-3 text-muted-foreground">
        To fulfil your order and to reach you about it. Your phone number is
        also the key that lets you look your own order up on the tracking page.
      </p>

      <h2 className="display mt-8 text-2xl">What stays on your device</h2>
      <p className="mt-3 text-muted-foreground">
        Your cart, your wishlist and your recently viewed pieces are stored in
        your own browser, not on our servers. Clearing your browser data clears
        them.
      </p>

      <h2 className="display mt-8 text-2xl">Who else sees it</h2>
      <p className="mt-3 text-muted-foreground">
        Our delivery partner receives the address needed to deliver your order.
        Nobody else. We do not sell customer information.
      </p>

      <h2 className="display mt-8 text-2xl">Asking us to delete it</h2>
      <p className="mt-3 text-muted-foreground">
        Message {BUSINESS.phoneDisplay} on WhatsApp with your order number and
        we will delete your details from our records, unless we are still
        required to keep the sale record.
      </p>
    </div>
  );
}
