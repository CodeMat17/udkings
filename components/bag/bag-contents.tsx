"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBagIcon, XIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { clearBag, closeBag, lineKey, removeFromBag, setBagQuantity, useBag } from "@/lib/bag";
import { unitPriceFor } from "@/lib/pricing";
import { formatNaira } from "@/lib/format";
import { composeBagMessage } from "@/lib/whatsapp";
import { waLink } from "@/lib/business";
import { cn } from "@/lib/utils";

/**
 * The bag, shared by the slide-over and the /cart page. Its only way out is a
 * WhatsApp message listing the pieces — the shop confirms availability and the
 * final price in the chat.
 */
export function BagContents({ variant }: { variant: "sheet" | "page" }) {
  const { lines, ready, count, estimate } = useBag();
  const sheet = variant === "sheet";
  const onNavigate = sheet ? closeBag : undefined;

  if (!ready) {
    return <div className="mt-6 h-48 animate-pulse rounded-md bg-secondary" />;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center px-4 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-secondary">
          <ShoppingBagIcon className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="display mt-6 text-3xl">Your bag is empty</p>
        <p className="mt-2 max-w-[34ch] text-sm text-muted-foreground">
          Add the pieces you love, then send the list to us on WhatsApp in one tap.
        </p>
        <Link href="/shop" onClick={onNavigate} className="btn btn-primary mt-8">
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        sheet ? "flex min-h-0 flex-1 flex-col" : "grid items-start gap-10 lg:grid-cols-[1fr_380px]",
      )}
    >
      <ul
        className={cn(
          "divide-y divide-border",
          sheet ? "min-h-0 flex-1 overflow-y-auto overscroll-contain" : "border-y border-border",
        )}
      >
        {lines.map((line) => {
          const key = lineKey(line);
          const price = unitPriceFor(line, line.quantity);
          return (
            <li key={key} className="flex gap-4 py-5">
              <Link
                href={`/product/${line.slug}`}
                onClick={onNavigate}
                className="relative block aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-sm bg-secondary sm:w-24"
              >
                <Image src={line.image} alt="" fill sizes="96px" className="object-cover" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${line.slug}`}
                      onClick={onNavigate}
                      className="line-clamp-2 leading-snug font-medium hover:underline"
                    >
                      {line.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {line.size ? `Size ${line.size}` : "Size confirmed on WhatsApp"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromBag(key)}
                    aria-label={`Remove ${line.name} from your bag`}
                    className="-mt-1.5 -mr-2 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <XIcon className="size-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <QuantityStepper
                    size="sm"
                    value={line.quantity}
                    label={`Quantity of ${line.name}`}
                    onChange={(next) => setBagQuantity(key, next)}
                  />
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{formatNaira(price.lineTotal)}</p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className={cn(
          sheet
            ? "border-t border-border pt-5"
            : "rounded-lg border border-border bg-card p-6 lg:sticky lg:top-28",
        )}
      >
        {sheet ? null : <h2 className="display mb-5 text-2xl">Summary</h2>}
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Pieces</dt>
            <dd className="tabular-nums">{count}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Estimated total</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatNaira(estimate)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Nothing is paid here. We confirm availability, delivery and your final
          price with you on WhatsApp.
        </p>
        <a
          href={waLink(composeBagMessage(lines))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp mt-5 w-full"
        >
          <WhatsAppIcon className="size-5" aria-hidden="true" />
          Send order on WhatsApp
          <span className="sr-only">, opens in a new tab</span>
        </a>
        <button
          type="button"
          onClick={clearBag}
          className="mt-3 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear bag
        </button>
      </div>
    </div>
  );
}
