import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";
import { HandoffButton } from "@/components/checkout/handoff-button";
import { findOrder } from "@/lib/order-store";
import { composeOrderMessage } from "@/lib/whatsapp";
import { waLink, BUSINESS } from "@/lib/business";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

export default async function OrderPage(props: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await props.params;
  const order = await findOrder(orderNumber);
  if (!order) notFound();

  const message = composeOrderMessage(order);
  const href = waLink(message);
  const pieces = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="shell max-w-[68ch] py-12">
      <CheckCircle2Icon className="size-10 text-stock" aria-hidden="true" />
      <p className="label mt-4 text-muted-foreground">Order created</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)] tabular-nums">
        {order.orderNumber}
      </h1>
      <p className="mt-4 text-lg">
        Thank you, {order.customer.name}. Your order is saved with us. Send it on
        WhatsApp now and we will confirm availability, the delivery fee and
        payment details.
      </p>

      <dl className="mt-8 grid gap-4 rounded-md border border-border bg-card p-6 sm:grid-cols-2">
        <div>
          <dt className="label text-muted-foreground">Order type</dt>
          <dd className="mt-1 font-bold">
            {order.fulfilment === "pickup" ? "Pickup at the shop" : "Delivery"}
          </dd>
        </div>
        <div>
          <dt className="label text-muted-foreground">Pieces</dt>
          <dd className="mt-1 font-bold tabular-nums">{pieces}</dd>
        </div>
        <div>
          <dt className="label text-muted-foreground">Delivery</dt>
          <dd className="mt-1 font-bold">
            {order.fulfilment === "pickup"
              ? "Pickup at the shop"
              : order.deliveryFee === null
                ? "Set by the shop"
                : formatNaira(order.deliveryFee)}
          </dd>
        </div>
        <div>
          <dt className="label text-muted-foreground">
            {order.fulfilment === "pickup" ? "Total" : "Total for the goods"}
          </dt>
          <dd className="mt-1 text-lg font-extrabold tabular-nums">
            {formatNaira(order.total)}
          </dd>
        </div>
      </dl>

      {/* Said plainly here, before the handoff, because this is the last screen
          the customer reads before the conversation starts. */}
      {order.fulfilment === "delivery" ? (
        <p className="mt-6 rounded-md border border-border bg-secondary p-4 font-semibold">
          The delivery fee is not on this order. Only the shop sets it — we look
          at your address and what you have ordered, then tell you the fee on
          WhatsApp. The {formatNaira(order.total)} above is for the goods, and
          nothing is charged until you have the full amount from us.
        </p>
      ) : null}

      <HandoffButton href={href} orderNumber={order.orderNumber} />

      <Link
        href={`/track?order=${order.orderNumber}`}
        className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md border border-border font-bold"
      >
        Track this order
      </Link>

      <section className="mt-10">
        <h2 className="display text-2xl">What we are sending</h2>
        <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-card p-4 text-sm whitespace-pre-wrap">
          {message}
        </pre>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Prefer to call? {BUSINESS.phoneDisplay} —{" "}
        <a href={BUSINESS.telHref} className="font-bold hover:underline">
          tap to dial
        </a>
        .
      </p>
    </div>
  );
}
