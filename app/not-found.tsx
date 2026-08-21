import Link from "next/link";
import { getCategories } from "@/lib/catalog";

export default async function NotFound() {
  const categories = await getCategories();
  return (
    <div className="shell flex min-h-[70svh] max-w-[68ch] flex-col justify-center py-16">
      <p className="label text-accent-ink">404</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        That page is not on the rail
      </h1>
      <p className="mt-4 text-muted-foreground">
        The link may be old, or the piece may have sold out and come off the
        catalogue. Start from a category — everything we have is one tap away.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/category/${category.slug}`}
              className="inline-flex h-11 items-center rounded-sm border border-border px-4 font-semibold hover:bg-accent"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 w-fit items-center rounded-md bg-primary px-6 font-extrabold text-primary-foreground"
      >
        Back to the home page
      </Link>
    </div>
  );
}
