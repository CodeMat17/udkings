import type { Metadata } from "next";
import { DELIVERY_ZONES, zoneLabel } from "@/lib/zones";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Delivery information and zones",
  description:
    "Delivery fees and timings from UDKING'S Collections, Lagos Island. The fees here are a guide by zone; the shop confirms the fee for your order on WhatsApp before you pay.",
  alternates: { canonical: "/delivery" },
};

export default function DeliveryPage() {
  return (
    <div className="shell max-w-[68ch] py-10">
      <p className="label text-accent-ink">Getting it to you</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        Delivery
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        These are what delivery usually costs by zone, so you know what to
        expect. The fee for your own order is set by the shop — we look at the
        address and what you are sending for, then tell you the fee on WhatsApp
        before anything moves and before you pay. We would rather tell you
        honestly than have the website quote a number we cannot stand behind.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-left">
          <caption className="sr-only">Delivery zones, usual fees and timings</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="label py-3 text-muted-foreground">Zone</th>
              <th scope="col" className="label py-3 text-muted-foreground">Usual fee</th>
              <th scope="col" className="label py-3 text-muted-foreground">Arrives</th>
            </tr>
          </thead>
          <tbody>
            {DELIVERY_ZONES.map((zone) => (
              <tr key={zoneLabel(zone)} className="border-b border-border">
                <td className="py-3 font-semibold">{zoneLabel(zone)}</td>
                <td className="py-3 font-extrabold tabular-nums">
                  {zone.fee === null ? (
                    <span className="text-sm font-bold text-muted-foreground">
                      Set on WhatsApp
                    </span>
                  ) : (
                    formatNaira(zone.fee)
                  )}
                </td>
                <td className="py-3 text-muted-foreground">{zone.etaDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="display mt-12 text-2xl">Pickup</h2>
      <p className="mt-3 text-muted-foreground">
        Pickup is free. Choose it at checkout, and collect from Shop BF04,
        Andora Plaza on Breadfruit Street. We hold pickup orders for three days.
      </p>

      <h2 className="display mt-10 text-2xl">Payment</h2>
      <p className="mt-3 text-muted-foreground">
        Nothing is charged on this website. We confirm your order and payment
        details on WhatsApp, then dispatch.
      </p>
    </div>
  );
}
