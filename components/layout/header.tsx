import Link from "next/link";
import Image from "next/image";
import { HeartIcon, SearchIcon } from "lucide-react";
import { getCategories } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";
import { ThemeToggle } from "./theme-toggle";
import { BagButton } from "./bag-button";

const ICON =
  "grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-secondary";

export async function Header() {
  const categories = await getCategories();

  return (
    <>
      <div className="bg-[#17130f] text-[#f2ede6]">
        <p className="shell flex h-9 items-center justify-center gap-2 text-center text-[0.625rem] font-medium tracking-[0.2em] uppercase sm:text-[0.6875rem]">
          <span>Order on WhatsApp</span>
          <span aria-hidden="true" className="hidden opacity-40 sm:inline">·</span>
          <span className="hidden sm:inline">Lagos Island</span>
        </p>
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
        <div className="shell grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center">
            <Link href="/shop#search" aria-label="Search the collection" className={`${ICON} -ml-2 lg:hidden`}>
              <SearchIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-7 text-sm font-medium">
                <li>
                  <Link href="/shop" className="link-underline">
                    Shop all
                  </Link>
                </li>
                <li className="group relative">
                  <button type="button" className="link-underline cursor-default">
                    Collections
                  </button>
                  <div className="invisible absolute top-full -left-4 pt-5 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="w-60 rounded-md border border-border bg-popover p-2 shadow-elev2">
                      {categories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/category/${category.slug}`}
                            className="flex h-10 items-center rounded-sm px-3 text-sm hover:bg-secondary"
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>
            </nav>
          </div>

          <Link href="/" aria-label={`${BUSINESS.name}, home`} className="justify-self-center">
            <Image
              src="/logo_2.webp"
              alt=""
              width={57}
              height={44}
              preload
              className="h-10 w-auto"
            />
          </Link>

          <div className="-mr-2 flex items-center justify-end gap-0.5">
            <Link href="/shop#search" aria-label="Search the collection" className={`${ICON} hidden lg:grid`}>
              <SearchIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <Link href="/wishlist" aria-label="Saved pieces" className={`${ICON} hidden sm:grid`}>
              <HeartIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <BagButton className={ICON} />
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
