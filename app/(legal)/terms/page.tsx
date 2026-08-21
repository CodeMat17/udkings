import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of sale",
  description:
    "The terms UDKING'S Collections sells under — pricing, order confirmation, delivery, pickup, exchanges and how disputes are handled.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="shell max-w-[68ch] py-10">
      <h1 className="display text-[length:var(--text-display-l)]">Terms of sale</h1>

      <h2 className="display mt-10 text-2xl">Orders</h2>
      <p className="mt-3 text-muted-foreground">
        Placing an order on this website creates an order record with a number.
        It is not a completed sale until we confirm stock and payment with you
        on WhatsApp. If a piece has sold out between your order and our
        confirmation, we will tell you and refund or substitute at your choice.
      </p>

      <h2 className="display mt-8 text-2xl">Prices</h2>
      <p className="mt-3 text-muted-foreground">
        Prices are in Nigerian naira and are recalculated on our own systems
        when your order is created. The price you see on the confirmation is the
        price that applies. Wholesale rates apply from the quantity stated on
        each product page.
      </p>

      <h2 className="display mt-8 text-2xl">Delivery</h2>
      <p className="mt-3 text-muted-foreground">
        Lagos zone fees are fixed and published. Outside Lagos, the fee is
        confirmed with you before dispatch. Delivery timings are estimates that
        depend on the courier.
      </p>

      <h2 className="display mt-8 text-2xl">Exchanges</h2>
      <p className="mt-3 text-muted-foreground">
        Bring an unworn piece with its tags back to the shop within three days
        and we will exchange it for another size, or another piece of the same
        value.
      </p>
    </div>
  );
}
