import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

/**
 * The editorial opener: one full-bleed photograph, a serif headline, two
 * routes in. The headline is server HTML and never animated, because it is
 * the LCP element.
 */
export function Hero({ image }: { image: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#17130f] text-[#f7f2ea]">
      <Image
        src={image}
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/40 to-transparent" />

      <div className="shell flex min-h-[76svh] flex-col justify-end pt-28 pb-14 sm:min-h-[84svh] sm:pb-20">
        <p className="label fade-up text-[#f7f2ea]/80">UDKING&rsquo;S Collections · Lagos Island</p>
        <h1 className="display mt-5 max-w-[12ch] text-[length:var(--text-display-xl)] text-balance">
          Dressed for every <em>occasion</em>
        </h1>
        <p className="fade-up mt-6 max-w-[44ch] text-base text-[#f7f2ea]/85 [animation-delay:120ms] sm:text-lg">
          Gowns, denim, tops and two-piece sets, chosen piece by piece in Lagos —
          priced for one, or for a whole rail.
        </p>
        <div className="fade-up mt-9 flex flex-wrap gap-3 [animation-delay:220ms]">
          <Link href="/shop" className="btn group bg-[#f7f2ea] text-[#17130f] hover:bg-white">
            Shop the collection
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
