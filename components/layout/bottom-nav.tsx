"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, HomeIcon, LayoutGridIcon, ShoppingBagIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { openBag, useBag } from "@/lib/bag";
import { BUSINESS, waLink } from "@/lib/business";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/shop", label: "Shop", Icon: LayoutGridIcon },
  { href: "/wishlist", label: "Saved", Icon: HeartIcon },
] as const;

const ITEM =
  "flex min-h-14 w-full flex-col items-center justify-center gap-1 py-2 text-[0.625rem] font-medium tracking-wide";

export function BottomNav() {
  const pathname = usePathname();
  const { count, ready } = useBag();
  const show = ready && count > 0;

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {LINKS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(ITEM, active ? "text-foreground" : "text-muted-foreground")}
              >
                <Icon className="size-5" strokeWidth={active ? 2 : 1.5} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <button
            type="button"
            onClick={openBag}
            aria-label={show ? `Open bag, ${count} ${count === 1 ? "item" : "items"}` : "Open bag"}
            className={cn(ITEM, "text-muted-foreground")}
          >
            <span className="relative">
              <ShoppingBagIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.5625rem] leading-none font-bold text-primary-foreground transition-transform duration-300",
                  show ? "scale-100" : "scale-0",
                )}
              >
                {show ? (count > 99 ? "99+" : count) : ""}
              </span>
            </span>
            Bag
          </button>
        </li>

        <li className="flex-1">
          <a
            href={waLink(`Hello ${BUSINESS.name}, I have a question about an item on your website.`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp, opens in a new tab"
            className={cn(ITEM, "text-whatsapp dark:text-stock")}
          >
            <WhatsAppIcon className="size-5" aria-hidden="true" />
            WhatsApp
          </a>
        </li>
      </ul>
    </nav>
  );
}
