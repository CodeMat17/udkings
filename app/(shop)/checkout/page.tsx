"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrder } from "@/app/actions";
import { useCart, useCartValidation } from "@/lib/cart-store";
import { ZONE_LABELS, zoneFor } from "@/lib/zones";
import { formatNaira } from "@/lib/format";
import { PHONE_ERROR, isValidPhone } from "@/lib/validators";
import { BUSINESS } from "@/lib/business";
import type { Fulfilment } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/checkout/date-time-picker";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<string, string>>;

export default function CheckoutPage() {
  const router = useRouter();
  const { priced, subtotal, lines, clear, ready } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  // Reprice and re-check stock against the server before anything is submitted.
  const validated = useCartValidation();

  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [zone, setZone] = useState(ZONE_LABELS[0] ?? "");
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedZone = zoneFor(zone);
  // The zone fee is a published guide, never the price of this delivery: only
  // the shop sets that, once it has seen the address and the load. So the total
  // here is the goods, and delivery is added when the shop confirms it.
  const feeGuide = fulfilment === "pickup" ? null : (selectedZone?.fee ?? null);
  const total = subtotal;

  if (ready && validated && priced.length === 0) {
    return (
      <div className="shell py-10">
        <h1 className="display text-[length:var(--text-display-l)]">Checkout</h1>
        <p className="mt-4 text-muted-foreground">
          Your cart is empty, so there is nothing to send yet.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-12 items-center rounded-md bg-primary px-6 font-extrabold text-primary-foreground"
        >
          Go to the catalogue
        </Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();

    const next: Errors = {};
    if (!value("name")) next.name = "Tell us the name to put on the order.";
    if (!isValidPhone(value("phone"))) next.phone = PHONE_ERROR;
    if (!sameWhatsapp && !isValidPhone(value("whatsapp"))) {
      next.whatsapp = PHONE_ERROR;
    }
    if (fulfilment === "delivery") {
      if (!value("address")) next.address = "Enter the street address we should deliver to.";
      if (!value("city")) next.city = "Enter the town or area, like Ikoyi.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0];
      const field = formRef.current?.elements.namedItem(first ?? "");
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    setSubmitting(true);
    const result = await createOrder({
      fulfilment,
      customer: {
        name: value("name"),
        phone: value("phone"),
        whatsapp: sameWhatsapp ? value("phone") : value("whatsapp"),
      },
      ...(fulfilment === "pickup"
        ? {
            pickup: {
              preferredDate: value("pickupDate"),
              preferredTime: value("pickupTime"),
            },
          }
        : {
            delivery: {
              zoneLabel: zone,
              address: `${value("address")}, ${value("city")}`,
              landmark: value("landmark"),
              preferredDate: value("deliveryDate"),
              preferredTime: value("deliveryTime"),
              instructions: value("instructions"),
            },
          }),
      lines,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error("That order did not go through", { description: result.error });
      return;
    }

    toast.success(`Order ${result.order.orderNumber} placed`, {
      description: "Keep the number — it is how you track this order.",
    });

    // Clear the cart only after the order mutation succeeds.
    clear();
    router.push(`/order/${result.order.orderNumber}`);
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`${key}-error`} className="mt-1.5 text-sm font-semibold text-gone">
        {errors[key]}
      </p>
    ) : null;

  const inputClass =
    "mt-1.5 h-12 w-full rounded-sm border border-input bg-card px-3 text-base";

  return (
    <div className="shell py-10">
      <h1 className="display text-[length:var(--text-display-l)]">Checkout</h1>
      <p className="mt-3 max-w-[60ch] text-muted-foreground">
        No account needed. We create the order here, give it a number, then hand
        you to WhatsApp with the whole thing written out.
      </p>

      <div
        aria-live="polite"
        className="sr-only"
      >
        {Object.keys(errors).length > 0
          ? `${Object.keys(errors).length} fields need attention.`
          : ""}
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-10">
          <fieldset>
            <legend className="display text-2xl">1. Order type</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "delivery" as const,
                    title: "Delivery",
                    body: "We send it to your address. The shop sets the delivery fee and tells you on WhatsApp.",
                  },
                  {
                    value: "pickup" as const,
                    title: "Pickup",
                    body: `Collect at ${BUSINESS.address.street}, ${BUSINESS.address.locality}.`,
                  },
                ]
              ).map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer gap-3 rounded-md border p-4"
                  style={{
                    borderColor:
                      fulfilment === option.value
                        ? "var(--accent-ink)"
                        : "var(--border)",
                  }}
                >
                  <input
                    type="radio"
                    name="fulfilment"
                    value={option.value}
                    checked={fulfilment === option.value}
                    onChange={() => setFulfilment(option.value)}
                    className="mt-1 size-5 accent-[var(--accent-ink)]"
                  />
                  <span>
                    <span className="block font-extrabold">{option.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {option.body}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {fulfilment === "pickup" ? (
              <div className="mt-6 rounded-md border border-border bg-card p-5">
                <p className="font-bold">{BUSINESS.address.street}</p>
                <p className="text-sm text-muted-foreground">
                  {BUSINESS.address.landmark}, {BUSINESS.address.locality},{" "}
                  {BUSINESS.address.region}
                </p>
                <div className="mt-4">
                  <DateTimePicker dateName="pickupDate" timeName="pickupTime" />
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="zone" className="font-semibold">
                    Delivery zone
                  </label>
                  <Select
                    name="zone"
                    value={zone}
                    onValueChange={(value) => setZone(value as string)}
                  >
                    <SelectTrigger
                      id="zone"
                      className={cn(inputClass, "data-[size=default]:h-12")}
                    >
                      <SelectValue placeholder="Choose a zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONE_LABELS.map((label) => (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {feeGuide === null
                      ? `Usually ${selectedZone?.etaDays}. The shop sets the delivery fee for this zone on WhatsApp.`
                      : `Usually around ${formatNaira(feeGuide)} · ${selectedZone?.etaDays}. A guide only — the shop confirms the fee on WhatsApp.`}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="font-semibold">
                    Street address
                  </label>
                  <input
                    id="address"
                    name="address"
                    autoComplete="address-line1"
                    aria-describedby={errors.address ? "address-error" : undefined}
                    aria-invalid={errors.address ? true : undefined}
                    className={inputClass}
                  />
                  {fieldError("address")}
                </div>
                <div>
                  <label htmlFor="city" className="font-semibold">
                    Town or area
                  </label>
                  <input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    aria-describedby={errors.city ? "city-error" : undefined}
                    aria-invalid={errors.city ? true : undefined}
                    className={inputClass}
                  />
                  {fieldError("city")}
                </div>
                <div>
                  <label htmlFor="landmark" className="font-semibold">
                    Landmark <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="landmark"
                    name="landmark"
                    placeholder="Beside Zenith Bank"
                    className={inputClass}
                  />
                </div>
                <div>
                  <DateTimePicker
                    dateName="deliveryDate"
                    timeName="deliveryTime"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="instructions" className="font-semibold">
                    Instructions for the rider{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    rows={2}
                    className="mt-1.5 w-full rounded-sm border border-input bg-card p-3 text-base"
                  />
                </div>
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="display text-2xl">2. Your details</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="font-semibold">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  aria-describedby={errors.name ? "name-error" : undefined}
                  aria-invalid={errors.name ? true : undefined}
                  className={inputClass}
                />
                {fieldError("name")}
              </div>
              <div>
                <label htmlFor="phone" className="font-semibold">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  aria-invalid={errors.phone ? true : undefined}
                  className={inputClass}
                />
                {fieldError("phone")}
              </div>
              <div>
                <label htmlFor="whatsapp" className="font-semibold">
                  WhatsApp number
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  disabled={sameWhatsapp}
                  defaultValue=""
                  aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
                  aria-invalid={errors.whatsapp ? true : undefined}
                  className={`${inputClass} disabled:opacity-60`}
                />
                {fieldError("whatsapp")}
                <label className="mt-2 flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={sameWhatsapp}
                    onChange={(e) => setSameWhatsapp(e.target.checked)}
                    className="size-5 accent-[var(--accent-ink)]"
                  />
                  Same as my phone number
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="display text-2xl">3. Review</legend>
            <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-card">
              {priced.map((line) => (
                <li
                  key={line.productId}
                  className="flex flex-wrap items-baseline justify-between gap-2 p-4"
                >
                  <span>
                    <span className="font-bold">{line.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {line.quantity}{" "}
                      {line.quantity === 1 ? "piece" : "pieces"} at{" "}
                      {formatNaira(line.unitPrice)}
                      {line.appliedTier === "wholesale" ? " (wholesale)" : ""}
                    </span>
                  </span>
                  <span className="font-extrabold tabular-nums">
                    {formatNaira(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>

        <aside className="h-fit rounded-md border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="display text-2xl">Order total</h2>
          <dl className="mt-5 space-y-3">
            <div className="flex justify-between gap-4">
              <dt>Subtotal</dt>
              <dd className="font-extrabold tabular-nums">{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Delivery</dt>
              <dd className="text-right font-semibold">
                {fulfilment === "pickup" ? (
                  "Pickup at the shop"
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Set by the shop
                    {feeGuide !== null ? ` · around ${formatNaira(feeGuide)}` : ""}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3 text-lg">
              <dt className="font-extrabold">
                {fulfilment === "pickup" ? "Total" : "Total for the goods"}
              </dt>
              <dd className="font-extrabold tabular-nums">{formatNaira(total)}</dd>
            </div>
          </dl>

          {fulfilment === "delivery" ? (
            <p className="mt-4 rounded-md border border-border bg-secondary p-3 text-sm font-semibold">
              The delivery fee is not decided here. We set it once we have seen
              your address and what you are ordering, and we tell you the fee on
              WhatsApp before you pay anything. The total above is the goods
              only.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary font-extrabold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "Creating your order…" : "Create order & continue"}
          </button>
          <p className="mt-3 text-sm text-muted-foreground">
            The next screen gives you your order number and the WhatsApp
            handoff. Nothing is charged here.
          </p>
        </aside>
      </form>
    </div>
  );
}
