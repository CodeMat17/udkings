"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export type HeroSlide = {
  slug: string;
  name: string;
  eyebrow: string;
  image: string;
  imageAlt: string;
  price: string;
  wholesale: string | null;
};

const INTERVAL = 5000;

/**
 * The hero carousel: one garment at a time, cross-faded, auto-advancing.
 *
 * All slides are in the DOM from the first paint — a crawler and a
 * JS-disabled browser see every garment and every link. The rotation is the
 * only thing hydration adds, and it stops dead under `prefers-reduced-motion`
 * (the first slide simply stays), because an auto-rotating hero is exactly the
 * thing that setting exists to stop.
 *
 * Only the first slide's image is eager; the rest load lazily, so the fold
 * still costs one photograph on a 3G phone.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      INTERVAL,
    );
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="hero-line mx-auto w-full max-w-[360px] lg:mb-1"
      style={{ animationDelay: "390ms" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured pieces"
    >
      <div className="relative overflow-hidden rounded-lg border border-white/20 bg-white/5 shadow-[0_30px_60px_-24px_rgb(8_10_24/0.85)]">
        <div className="relative aspect-[4/5]">
          {slides.map((slide, index) => (
            <figure
              key={slide.slug}
              className="absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none"
              style={{ opacity: index === active ? 1 : 0 }}
              aria-hidden={index !== active}
              inert={index !== active}
            >
              <Link href={`/product/${slide.slug}`} className="group block h-full">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1024px) 360px, 90vw"
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 border-t border-white/20 bg-[rgb(var(--scrim)/0.78)] px-5 py-4 backdrop-blur-sm">
                  <span className="min-w-0">
                    <span className="label block text-[var(--brass-lift)]">
                      {slide.eyebrow}
                    </span>
                    <span className="mt-1 block font-extrabold text-white group-hover:underline">
                      {slide.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-extrabold text-white">{slide.price}</span>
                    {slide.wholesale ? (
                      <span className="mt-0.5 block text-xs whitespace-nowrap text-white/70">
                        {slide.wholesale}
                      </span>
                    ) : null}
                  </span>
                </figcaption>
              </Link>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.slug}
            type="button"
            onClick={() => setActive(index)}
            aria-label={slide.name}
            aria-current={index === active}
            className="grid size-8 place-items-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                index === active
                  ? "w-6 bg-[var(--hibiscus-lift)]"
                  : "w-1.5 bg-white/45"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
