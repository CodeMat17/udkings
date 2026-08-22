"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
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
  // Everything the shop can just as easily ask in the chat lives behind this.
  const [moreOpen, setMoreOpen] = useState(false);
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

    // Three things only: who you are, the number we reply on, and where it
    // goes. Everything else is a question for the conversation itself.
    const next: Errors = {};
    if (!value("name")) next.name = "Tell us the name to put on the order.";
    if (!isValidPhone(value("phone"))) next.phone = PHONE_ERROR;
    if (fulfilment === "delivery" && !value("address")) {
      next.address = "Where should we deliver? Street and area is enough.";
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
        whatsapp: value("phone"),
      },
      ...(fulfilment === "pickup"
        ? { pickup: { preferredDate: "", preferredTime: "" } }
        : {
            delivery: {
              zoneLabel: zone,
              address: value("address"),
              landmark: value("landmark"),
              preferredDate: "",
              preferredTime: "",
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

    // Clear the cart only after the order mutation succeeds.
    clear();
    // Straight into the chat: the order screen opens WhatsApp itself, so this
    // submit is the last thing the customer has to press.
    router.push(`/order/${result.order.orderNumber}?send=1`);
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
        One short form, then WhatsApp opens with your whole order written out.
        No account, nothing charged here.
      </p>

      <div aria-live="polite" className="sr-only">
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
        <div className="space-y-8">
          <fieldset>
            <legend className="display text-2xl">Delivery or pickup?</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "delivery" as const,
                    title: "Delivery",
                    body: "We send it to your address. The shop sets the fee on WhatsApp.",
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
          </fieldset>

          <fieldset>
            <legend className="display text-2xl">Your details</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
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
                  WhatsApp number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  aria-invalid={errors.phone ? true : undefined}
                  className={inputClass}
                />
                {fieldError("phone")}
              </div>

              {fulfilment === "delivery" ? (
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="font-semibold">
                    Delivery address
                  </label>
                  <input
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    placeholder="12 Awolowo Road, Ikoyi"
                    aria-describedby={errors.address ? "address-error" : undefined}
                    aria-invalid={errors.address ? true : undefined}
                    className={inputClass}
                  />
                  {fieldError("address")}
                </div>
              ) : (
                <div className="rounded-md border border-border bg-card p-4 sm:col-span-2">
                  <p className="font-bold">{BUSINESS.address.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {BUSINESS.address.landmark}, {BUSINESS.address.locality},{" "}
                    {BUSINESS.address.region}. We agree a time on WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {fulfilment === "delivery" ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setMoreOpen((open) => !open)}
                  aria-expanded={moreOpen}
                  className="inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4"
                >
                  <ChevronDownIcon
                    className={cn(
                      "size-4 transition-transform",
                      moreOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                  {moreOpen
                    ? "Hide extra details"
                    : "Add a landmark, zone or note (optional)"}
                </button>

                {moreOpen ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
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
                          ? `Usually ${selectedZone?.etaDays}. The shop sets the fee on WhatsApp.`
                          : `Usually around ${formatNaira(feeGuide)} · ${selectedZone?.etaDays}. A guide only.`}
                      </p>
                    </div>
                    <div>
                      <label htmlFor="landmark" className="font-semibold">
                        Landmark
                      </label>
                      <input
                        id="landmark"
                        name="landmark"
                        placeholder="Beside Zenith Bank"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="instructions" className="font-semibold">
                        Note for the rider
                      </label>
                      <textarea
                        id="instructions"
                        name="instructions"
                        rows={2}
                        className="mt-1.5 w-full rounded-sm border border-input bg-card p-3 text-base"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </fieldset>
        </div>

        <aside className="h-fit rounded-md border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="display text-2xl">Your order</h2>
          <ul className="mt-4 space-y-3">
            {priced.map((line) => (
              <li
                key={line.productId}
                className="flex justify-between gap-3 text-sm"
              >
                <span>
                  <span className="font-bold">{line.name}</span>
                  <span className="block text-muted-foreground">
                    {line.quantity} {line.quantity === 1 ? "piece" : "pieces"} at{" "}
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

          <dl className="mt-5 space-y-3 border-t border-border pt-4">
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
              The delivery fee is set by the shop once we have seen your address,
              and we tell you on WhatsApp before you pay anything. The total
              above is the goods only.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary font-extrabold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "Opening WhatsApp…" : "Send order on WhatsApp"}
          </button>
          <p className="mt-3 text-sm text-muted-foreground">
            WhatsApp opens with your order and your order number. Nothing is
            charged here.
          </p>
        </aside>
      </form>
    </div>
  );
}
