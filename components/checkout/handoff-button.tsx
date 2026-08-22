"use client";

import { useEffect, useRef } from "react";
import { MessageCircleIcon } from "lucide-react";
import { confirmHandoff } from "@/app/actions";

/**
 * A real anchor, not window.open — popup blockers eat programmatic opens on
 * iOS Safari, and this is the one click the whole business depends on.
 * Orders left at whatsappOpened: false are the shop's follow-up list.
 *
 * With `auto`, the chat opens by itself the moment this screen lands, so a
 * customer who has just submitted the form presses nothing more. That is a
 * same-tab navigation, not a popup, so no blocker stands in front of it, and
 * the button below stays as the fallback if the handoff is dismissed or the
 * customer comes back to this page later.
 */
export function HandoffButton({
  href,
  orderNumber,
  auto = false,
}: {
  href: string;
  orderNumber: string;
  auto?: boolean;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (!auto || sent.current) return;
    sent.current = true;
    void confirmHandoff(orderNumber);
    window.location.href = href;
  }, [auto, href, orderNumber]);

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
      {auto ? "Open WhatsApp again" : "Send order on WhatsApp"}
      <span className="sr-only">, opens in a new tab</span>
    </a>
  );
}
