import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SaveButton } from "./save-button";
import type { ProductCardData } from "@/lib/card-data";

export const GRID_CLASS = "grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4";

export function ProductCard({
  product,
  priority = false,
  rail = false,
}: {
  product: ProductCardData;
  priority?: boolean;
  rail?: boolean;
}) {

  return (
    <article className={cn("group relative", rail && "w-[64vw] max-w-[290px] sm:w-[290px]")}>
      <Link
        href={`/product/${product.slug}`}
        className="block overflow-hidden rounded-md border border-border bg-card"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes={
              rail
                ? "(max-width: 640px) 64vw, 290px"
                : "(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 320px"
            }
            loading={priority ? "eager" : "lazy"}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {product.isNewArrival ? (
            <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
              New
            </span>
          ) : null}
        </div>

        <div className="border-t border-border px-3 py-2.5">
          <h3 className="line-clamp-1 text-[0.9375rem] font-medium">{product.name}</h3>
          <p className="mt-0.5 text-[0.9375rem] text-muted-foreground tabular-nums">
            {formatNaira(product.retailPrice)}
          </p>
        </div>
      </Link>

      <SaveButton
        product={product}
        className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-background/85 transition-colors hover:bg-background"
      />
    </article>
  );
}
