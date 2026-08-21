"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trackOrder } from "@/app/actions";
import { formatDate, formatNaira } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

/** The customer's words, not the database's. */
const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: "received", label: "Order received" },
  { status: "awaiting_confirmation", label: "Awaiting confirmation" },
  { status: "confirmed", label: "Confirmed" },
  { status: "preparing", label: "Preparing your order" },
  { status: "ready_for_pickup", label: "Ready for pickup" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "delivered", label: "Delivered" },
];

export function TrackForm() {
  const params = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    const result = await trackOrder(
      String(data.get("order") ?? ""),
      String(data.get("phone") ?? ""),
    );
    setBusy(false);
    if (result.ok) {
      setOrder(result.order);
      setError(null);
    } else {
      setOrder(null);
      setError(result.error);
    }
  }

  const steps = TIMELINE.filter((step) => {
    if (!order) return true;
    if (order.fulfilment === "pickup") return step.status !== "out_for_delivery";
    return step.status !== "ready_for_pickup";
  });
  const currentIndex = order
    ? steps.findIndex((s) => s.status === order.status)
    : -1;

  return (
    <>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="order" className="font-semibold">
            Order number
          </label>
          <input
            id="order"
            name="order"
            required
            defaultValue={params.get("order") ?? ""}
            placeholder="UDK-20260818-001"
            className="mt-1.5 h-12 w-full rounded-sm border border-input bg-card px-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="phone" className="font-semibold">
            Phone number you ordered with
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            className="mt-1.5 h-12 w-full rounded-sm border border-input bg-card px-3 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 font-extrabold text-primary-foreground disabled:opacity-60 sm:w-fit"
        >
          {busy ? "Looking…" : "Find my order"}
        </button>
      </form>

      <div aria-live="polite" className="mt-8">
        {error ? <p className="font-semibold text-gone">{error}</p> : null}

        {order ? (
          <section>
            <h2 className="display text-2xl tabular-nums">{order.orderNumber}</h2>
            <p className="mt-1 text-muted-foreground">
              Placed {formatDate(order.createdAt)} &middot;{" "}
              {order.fulfilment === "pickup" ? "Pickup" : "Delivery"} &middot;{" "}
              {formatNaira(order.total)}
            </p>

            <ol className="mt-6 space-y-4">
              {steps.map((step, index) => {
                const done = currentIndex >= index;
                return (
                  <li key={step.status} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-3 shrink-0 rounded-full"
                      style={{
                        background: done ? "var(--stock-ink)" : "var(--border)",
                      }}
                    />
                    <span className={done ? "font-bold" : "text-muted-foreground"}>
                      {step.label}
                      {currentIndex === index ? (
                        <span className="label ml-2 text-accent-ink">Now</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}
      </div>
    </>
  );
}
