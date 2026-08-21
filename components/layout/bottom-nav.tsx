"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  LayoutGridIcon,
  MessageCircleIcon,
  ShirtIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { BUSINESS, waLink } from "@/lib/business";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/shop", label: "Shop", Icon: ShirtIcon },
  { href: "/categories", label: "Categories", Icon: LayoutGridIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { count, ready } = useCart();

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[0.6875rem] font-bold tracking-wide",
                  active ? "text-accent-ink" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <Link
            href="/cart"
            aria-current={pathname === "/cart" ? "page" : undefined}
            aria-label={
              ready
                ? `Cart, ${count} ${count === 1 ? "item" : "items"}`
                : "Cart"
            }
            className={cn(
              "relative flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[0.6875rem] font-bold tracking-wide",
              pathname === "/cart" ? "text-accent-ink" : "text-muted-foreground",
            )}
          >
            <span className="relative">
              <ShoppingBagIcon className="size-5" aria-hidden="true" />
              {/* Reserves width for two digits so the badge never shifts layout. */}
              <span
                aria-hidden="true"
                className="absolute -top-2 -right-3 grid h-4 min-w-[1.375rem] place-items-center rounded-full px-1 text-[0.625rem] leading-none font-extrabold"
                style={{
                  background: ready && count > 0 ? "var(--accent-ink)" : "transparent",
                  color: ready && count > 0 ? "var(--background)" : "transparent",
                }}
              >
                {ready && count > 0 ? (
                  <span key={count} className="badge-pop">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : (
                  "0"
                )}
              </span>
            </span>
            Cart
          </Link>
        </li>

        <li className="flex-1">
          <a
            href={waLink(
              `Hello ${BUSINESS.name}, I have a question about an item on your website.`,
            )}
            target="_blank"
            rel="noopener"
            aria-label="Chat on WhatsApp, opens in a new tab"
            className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[0.6875rem] font-bold tracking-wide text-stock"
          >
            <MessageCircleIcon className="size-5" aria-hidden="true" />
            WhatsApp
          </a>
        </li>
      </ul>
    </nav>
  );
}
