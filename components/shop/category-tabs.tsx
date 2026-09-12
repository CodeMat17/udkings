import Link from "next/link";
import { cn } from "@/lib/utils";

/** Category navigation as a row of text tabs — Jeans, Tops, Gowns… */
export function CategoryTabs({
  categories,
  current,
  className,
}: {
  categories: { name: string; slug: string }[];
  /** Slug of the category being viewed; omitted where none is chosen. */
  current?: string;
  className?: string;
}) {
  return (
    <nav aria-label="Categories" className={cn("rail gap-2", className)}>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          aria-current={current === category.slug ? "page" : undefined}
          className="chip"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
