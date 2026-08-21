import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackForm } from "@/components/checkout/track-form";

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "Enter your UDKING'S order number and the phone number you ordered with to see exactly where your order has reached.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="shell max-w-[68ch] py-12">
      <p className="label text-accent-ink">Order status</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        Track your order
      </h1>
      <p className="mt-4 text-muted-foreground">
        We ask for both the order number and your phone number, because that
        pair is the only thing protecting your order details.
      </p>
      <Suspense fallback={<div className="mt-8 h-64" />}>
        <TrackForm />
      </Suspense>
    </div>
  );
}
