"use client";

import { useState } from "react";
import { MessageCircleIcon } from "lucide-react";
import { composeEnquiryMessage } from "@/lib/whatsapp";
import { waLink } from "@/lib/business";
import { isValidPhone, PHONE_ERROR } from "@/lib/validators";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function CatalogueRequest({ categories }: { categories: string[] }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [interest, setInterest] = useState(categories[0] ?? "");
  const [quantity, setQuantity] = useState("");
  const [touched, setTouched] = useState(false);

  const phoneOk = isValidPhone(phone);
  const ready = name.trim().length > 0 && phoneOk;
  const href = waLink(
    composeEnquiryMessage({ name, phone, business, interest, quantity }),
  );

  const inputClass =
    "mt-1.5 h-12 w-full rounded-sm border border-input bg-card px-3 text-base";

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="wh-name" className="font-semibold">
          Your name
        </label>
        <input
          id="wh-name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="wh-phone" className="font-semibold">
          WhatsApp number
        </label>
        <input
          id="wh-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && !phoneOk ? true : undefined}
          aria-describedby={touched && !phoneOk ? "wh-phone-error" : undefined}
          className={inputClass}
        />
        {touched && !phoneOk ? (
          <p id="wh-phone-error" className="mt-1.5 text-sm font-semibold text-gone">
            {PHONE_ERROR}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="wh-business" className="font-semibold">
          Business name <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="wh-business"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="wh-interest" className="font-semibold">
          Mostly interested in
        </label>
        <Select
          value={interest}
          onValueChange={(value) => setInterest(value as string)}
        >
          <SelectTrigger
            id="wh-interest"
            className={cn(inputClass, "data-[size=default]:h-12")}
          >
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="wh-qty" className="font-semibold">
          Estimated quantity per order
        </label>
        <input
          id="wh-qty"
          inputMode="numeric"
          placeholder="About 50 pieces a month"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-2">
        {ready ? (
          <a
            href={href}
            target="_blank"
            rel="noopener"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md font-extrabold sm:w-fit sm:px-8"
            style={{ background: "var(--stock-ink)", color: "var(--background)" }}
          >
            <MessageCircleIcon className="size-5" aria-hidden="true" />
            Send request on WhatsApp
            <span className="sr-only">, opens in a new tab</span>
          </a>
        ) : (
          <p className="text-sm font-semibold text-muted-foreground">
            Add your name and a WhatsApp number and the send button appears here.
          </p>
        )}
      </div>
    </div>
  );
}
