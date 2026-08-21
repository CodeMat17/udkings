import Link from "next/link";
import Image from "next/image";
import { bestPriceFor } from "@/lib/pricing";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ProductCardData } from "@/lib/card-data";

type Density = "rail" | "grid" | "list";

const SIZES: Record<Density, string> = {
  rail: "(max-width: 640px) 62vw, 260px",
  grid: "(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 300px",
  list: "112px",
};

export function ProductCard({
  product,
  density = "grid",
  priority = false,
}: {
  product: ProductCardData;
  density?: Density;
  priority?: boolean;
}) {
  const best = bestPriceFor(product);
  const hasWholesale = product.wholesaleMinQty !== null;

  if (density === "list") {
    return (
      <Card size="sm" className="group py-0 transition-colors hover:bg-accent">
        <Link href={`/product/${product.slug}`} className="flex gap-4 p-3">
          <Image
            src={product.image}
            alt={product.imageAlt}
            width={112}
            height={140}
            sizes={SIZES.list}
            className="h-35 w-28 shrink-0 rounded-md bg-white object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-heading leading-snug font-bold">{product.name}</h3>
            <p className="mt-1 text-lg font-extrabold">
              {formatNaira(product.retailPrice)}
            </p>
            {hasWholesale ? (
              <p className="label mt-2 text-wholesale">
                Wholesale from {product.wholesaleMinQty} pieces
              </p>
            ) : null}
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "shadow-md group relative gap-3 pt-0",
        density === "rail" ? "w-[62vw] max-w-[260px] sm:w-[260px]" : "w-full",
      )}>
      <Link href={`/product/${product.slug}`} className='block'>
        <div className='relative aspect-[4/5] overflow-hidden rounded-t-xl bg-white'>
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes={SIZES[density]}
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
            className='object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100'
          />
          {product.isNewArrival ? (
            <span className='absolute top-0 left-0 bg-background/95 px-3 py-1.5 text-[0.6875rem] font-extrabold tracking-widest text-accent-ink uppercase'>
              New in
            </span>
          ) : null}
        </div>

        <CardContent className='mt-3'>
          <h3 className='font-heading text-base leading-snug font-bold'>
            {product.name}
          </h3>
          <p className='mt-1 text-lg font-extrabold'>
            {formatNaira(product.retailPrice)}
            <span className='ml-1.5 text-sm font-semibold text-muted-foreground'>
              per piece
            </span>
          </p>
        </CardContent>

        {hasWholesale ? (
          <CardFooter className='py-2 text-xs'>
            <p className='text-wholesale'>
              Wholesale from {product.wholesaleMinQty} pieces &mdash;{" "}
              {formatNaira(best.unitPrice)} each
            </p>
          </CardFooter>
        ) : null}
      </Link>
    </Card>
  );
}
