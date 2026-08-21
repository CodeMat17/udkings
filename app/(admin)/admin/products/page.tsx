import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { listProducts } from "../../actions";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

type AdminProduct = Awaited<ReturnType<typeof listProducts>>[number];

/**
 * One row, used by both sections. An archived row is dimmed but complete —
 * Edit still opens it, because a piece often comes back with a new price.
 */
function ProductRow({ product }: { product: AdminProduct }) {
  return (
    <li
      className='flex items-center gap-4 rounded-xl border border-border p-3'>
      <div className='relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted'>
        <Image
          src={product.image.src}
          alt=''
          fill
          sizes='64px'
          className={`object-cover${product.isArchived ? " opacity-60" : ""}`}
        />
      </div>

      <div className='flex flex-col sm:flex-row sm:justify-between items-center gap-2 sm:gap-4 sm:w-full'>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium'>{product.name}</p>
          <p className='text-sm text-muted-foreground'>
            {formatNaira(product.retailPrice)} · {product.sku}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            render={<Link href={`/admin/products/${product.id}`} />}>
            Edit
          </Button>
          <ProductRowActions
            productId={product.id}
            name={product.name}
            isArchived={product.isArchived}
          />
        </div>
      </div>
    </li>
  );
}

/**
 * The inventory grid: one photograph, one price, and the two things that can be
 * done to a piece without opening it.
 *
 * Archived pieces sit in their own section at the bottom rather than mixed in
 * with a badge — what is in the shop is the list the admin works from every
 * day, and the archive is where they go looking on purpose. Restoring moves the
 * row back up into the shop list, because the page re-renders on the server
 * after the mutation.
 */
export default async function AdminProductsPage() {
  const products = await listProducts();
  const live = products.filter((product) => !product.isArchived);
  const archived = products.filter((product) => product.isArchived);

  return (
    <div className='mx-auto max-w-4xl px-6 py-12'>
      <div className='flex flex-wrap items-baseline justify-between gap-4'>
        <div>
          <Link
            href='/admin'
            className='label text-muted-foreground hover:text-foreground'>
            ← Admin
          </Link>
          <h1 className='display mt-1 text-3xl'>Products</h1>
        </div>
        <Button render={<Link href='/admin/products/new' />}>
          Add a piece
        </Button>
      </div>

      {products.length === 0 ? (
        <p className='mt-10 text-sm text-muted-foreground'>
          Nothing in the shop yet. Add the first piece and it appears on the
          storefront straight away.
        </p>
      ) : (
        <>
          <section className='mt-10'>
            <h2 className='label text-muted-foreground'>
              In the shop · {live.length}
            </h2>
            {live.length === 0 ? (
              <p className='mt-3 text-sm text-muted-foreground'>
                Every piece is archived, so the shop is empty. Restore one below
                or add a new piece.
              </p>
            ) : (
              <ul className='mt-3 space-y-3'>
                {live.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </ul>
            )}
          </section>

          {archived.length > 0 ? (
            <section className='mt-12 border-t border-border pt-8'>
              <h2 className='label text-muted-foreground'>
                Archived · {archived.length}
              </h2>
              <p className='mt-2 max-w-[60ch] text-sm text-muted-foreground'>
                Out of the shop and unorderable, with past orders still
                readable. Restore puts a piece back in the shop straight away and
                moves it back up to the list above.
              </p>
              <ul className='mt-4 space-y-3'>
                {archived.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
