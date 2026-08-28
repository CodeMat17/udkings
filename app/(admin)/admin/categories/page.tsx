import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryRowActions } from "@/components/admin/category-row-actions";
import { listCategories, listProducts } from "../../actions";

export const metadata: Metadata = {
  title: "Sections",
  robots: { index: false, follow: false },
};

/**
 * The rails of the shop, in the order shoppers meet them.
 *
 * Each row is what the shopper sees — the photograph and the word — plus the
 * count that is derived from the pieces. The count is also the answer to the
 * only question this page cannot answer with a button: a section holding
 * pieces cannot be removed until they are moved.
 *
 * Archived pieces are counted here on purpose. They are restorable, and a
 * restored piece needs the section it came from to still exist.
 */
export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);
  const countIn = (slug: string) =>
    products.filter((product) => product.categorySlug === slug).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <Link href="/admin" className="label text-muted-foreground hover:text-foreground">
            ← Admin
          </Link>
          <h1 className="display mt-1 text-3xl">Sections</h1>
        </div>
        <Button render={<Link href="/admin/categories/new" />}>Add a section</Button>
      </div>

      <p className="mt-4 max-w-[60ch] text-sm text-muted-foreground">
        The rails on the home page and on All categories. Change a photo or a name here and the
        shop shows it straight away.
      </p>

      {categories.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No sections yet. Add the first one and pieces can be filed under it.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {categories.map((category) => {
            const pieces = countIn(category.slug);
            return (
              <li
                key={category.slug}
                className="flex items-center gap-4 rounded-xl border border-border p-3"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={category.heroImage}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pieces} {pieces === 1 ? "piece" : "pieces"} · /category/{category.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/admin/categories/${category.slug}`} />}
                    >
                      Edit
                    </Button>
                    <CategoryRowActions
                      slug={category.slug}
                      name={category.name}
                      pieceCount={pieces}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
