import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

/**
 * The masthead. Not a hero — a band.
 *
 * A customer arrives here to see clothes, so this states the brand promise in
 * one line, gives the two buttons that matter, and stops. No carousel, no
 * paragraph, no viewport lock: the category strip and the first products are
 * already on screen underneath it, which is the whole point.
 *
 * The company write-up lives lower down the page and on /about, where a
 * customer who wants the story can find it.
 *
 * The ground is painted in CSS (`.hero-ground` + `.hero-weave`), which costs
 * zero bytes of image and never fights the headline for contrast. The headline
 * is the LCP element and ships as plain server HTML — no animation library
 * rendering it at opacity 0 until hydration, on exactly the slow connections
 * this site is built for.
 */
export function Hero() {
  return (
    <section className="hero-ground relative isolate overflow-hidden text-white">
      <div className="hero-weave absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="hero-bloom absolute -top-40 -left-32 -z-10 size-[32rem] rounded-full opacity-70"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        aria-hidden="true"
      />

      <div className="shell flex flex-col items-start gap-6 py-9 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:py-11">
        <div>
          <h1 className="display max-w-[14ch] text-[length:var(--text-display-l)] text-balance">
            Quality ladies&rsquo;{" "}
            <span className="text-[var(--hibiscus-lift)]">fashion</span>
          </h1>
          <p className="label mt-3 text-[var(--brass-lift)]">
            Retail &amp; wholesale &middot; Lagos Island
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Link
            href="/shop"
            className="group inline-flex h-10 items-center gap-2 rounded-md bg-[var(--hibiscus-lift)] px-3 font-extrabold text-[var(--indigo-900)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Shop now
            <ArrowRightIcon
              className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
                 
        </div>
      </div>
    </section>
  );
}
