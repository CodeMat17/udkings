"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { Textarea } from "@/components/ui/textarea";
import { composeProductEnquiry } from "@/lib/whatsapp";
import { BUSINESS, SITE_URL, waLink } from "@/lib/business";
import type { Product } from "@/lib/types";

/**
 * Every remaining question about a piece — another colour, a size we have not
 * listed, fabric, a bulk price — is answered on WhatsApp, not by a form that
 * lands in an inbox nobody reads. The message arrives with the piece already
 * identified, so the customer never has to describe it twice.
 */
export function ProductEnquiry({ product }: { product: Product }) {
  const [question, setQuestion] = useState("");

  const href = waLink(
    composeProductEnquiry({
      name: product.name,
      sku: product.sku,
      url: `${SITE_URL}/product/${product.slug}`,
      colors: product.colors,
      sizes: product.sizes,
      question,
    }),
  );

  return (
    <div className="mt-6 max-w-[68ch] rounded-md border border-border bg-card p-5">
      <label htmlFor="enquiry" className="font-semibold">
        Ask us anything about this piece
      </label>
      <p className="mt-1 text-sm text-muted-foreground">
        The colours and sizes listed above are the ones we have. Ask for the one
        you want &mdash; or about fabric, fit, a bulk price, when a colour is
        coming back &mdash; on {BUSINESS.phoneDisplay} and we will confirm it in
        the reply.
      </p>
      <Textarea
        id="enquiry"
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. Do you have this in Mid Blue, size 14?"
        className="mt-3 bg-background"
      />
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="mt-4 inline-flex h-12 items-center gap-2 rounded-md px-6 font-extrabold"
        style={{ background: "var(--stock-ink)", color: "var(--background)" }}
      >
        <WhatsAppIcon className="size-5" aria-hidden="true" />
        Ask on WhatsApp
      </a>
    </div>
  );
}
