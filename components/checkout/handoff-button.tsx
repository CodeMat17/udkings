"use client";

import { MessageCircleIcon } from "lucide-react";
import { confirmHandoff } from "@/app/actions";

/**
 * A real anchor, not window.open — popup blockers eat programmatic opens on
 * iOS Safari, and this is the one click the whole business depends on.
 * Orders left at whatsappOpened: false are the shop's follow-up list.
 */
export function HandoffButton({
  href,
  orderNumber,
}: {
  href: string;
  orderNumber: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => {
        void confirmHandoff(orderNumber);
      }}
      className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-md text-lg font-extrabold"
      style={{ background: "var(--stock-ink)", color: "var(--background)" }}
    >
      <MessageCircleIcon className="size-5" aria-hidden="true" />
      Send order on WhatsApp
      <span className="sr-only">, opens in a new tab</span>
    </a>
  );
}
