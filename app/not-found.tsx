import Link from "next/link";
import { getCategories } from "@/lib/catalog";

export default async function NotFound() {
  const categories = await getCategories();
  return (
    <div className="shell flex min-h-[80svh] max-w-3xl flex-col justify-center py-16">
      <p className="label text-muted-foreground">404</p>
      <h1 className="display mt-4 text-[length:var(--text-display-l)] text-balance">
        This piece is <em>no longer here</em>
      </h1>
      <p className="mt-5 max-w-[52ch] text-lg text-muted-foreground">
        The link may be old, or the piece may have sold out. Everything we have
        is one tap away.
      </p>
      <ul className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/category/${category.slug}`} className="chip">
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="btn btn-primary mt-10 w-fit">
        Back to the home page
      </Link>
    </div>
  );
}
