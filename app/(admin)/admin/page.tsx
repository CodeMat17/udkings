import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listCategories, listProducts, signOut } from "../actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * The signed-in landing. Admin pages stay dynamic and read Convex live; every
 * save refreshes the static storefront (see `refreshStorefront` in actions.ts).
 * Orders are not stored — they arrive and are handled on WhatsApp.
 */
export default async function AdminPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const live = products.filter((p) => !p.isArchived);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="label text-muted-foreground">UDKING&rsquo;S</p>
          <h1 className="display mt-1 text-4xl">Shop admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" render={<Link href="/admin/products" />}>
            Products
          </Button>
          <Button size="sm" variant="outline" render={<Link href="/admin/categories" />}>
            Sections
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Live pieces", value: live.length },
          { label: "Archived", value: products.length - live.length },
          { label: "Sections", value: categories.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <dt className="label text-muted-foreground">{stat.label}</dt>
            <dd className="display mt-2 text-4xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 max-w-[60ch] text-sm text-muted-foreground">
        Saving, archiving or deleting a piece or section updates the public shop
        automatically. Customer orders come to you on WhatsApp.
      </p>
    </div>
  );
}
