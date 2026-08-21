import Link from "next/link";
import Image from "next/image";
import { HeartIcon, SearchIcon, ShoppingBagIcon } from "lucide-react";
import { getCategories } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";
import { ThemeToggle } from "./theme-toggle";
import { CartCount } from "./cart-count";

const PRIMARY = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/new", label: "New in" },
  { href: "/shop?wholesale=1", label: "Wholesale" },
  { href: "/visit-us", label: "Visit us" },
];

export async function Header() {
  const categories = await getCategories();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="shell flex h-16 items-center gap-3">
        <Link href="/" className="shrink-0" aria-label={`${BUSINESS.name}, home`}>
          {/* Explicit dimensions and priority: this sits above the fold on
              every route, so it must never be the thing that shifts layout. */}
          <Image
            src="/logo_2.webp"
            alt=""
            width={57}
            height={44}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <nav aria-label="Primary" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-11 items-center rounded-md px-3 font-semibold hover:bg-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="group relative">
              <Link
                href="/categories"
                className="inline-flex h-11 items-center rounded-md px-3 font-semibold hover:bg-accent"
              >
                Categories
              </Link>
              <ul className="invisible absolute top-full left-0 w-56 rounded-md border border-border bg-popover p-1 opacity-0 shadow-elev2 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="flex h-11 items-center rounded-sm px-3 hover:bg-accent"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search products"
            className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-card hover:bg-accent"
          >
            <SearchIcon className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-card hover:bg-accent"
          >
            <HeartIcon className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href="/cart"
            className="relative hidden size-11 shrink-0 place-items-center rounded-md border border-border bg-card hover:bg-accent lg:grid"
          >
            <ShoppingBagIcon className="size-5" aria-hidden="true" />
            <CartCount />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
