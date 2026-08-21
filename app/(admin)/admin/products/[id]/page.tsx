import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/product-form";
import { listProducts } from "../../../actions";

export const metadata: Metadata = {
  title: "Edit piece",
  robots: { index: false, follow: false },
};

/**
 * Read through the admin listing rather than the cached storefront catalogue:
 * an archived piece has to be editable, and the storefront never sees one.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [products, categories] = await Promise.all([listProducts(), getCategories()]);
  const product = products.find((entry) => entry.id === id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/admin/products" className="label text-muted-foreground hover:text-foreground">
        ← Products
      </Link>
      <h1 className="display mt-1 text-3xl">{product.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {product.id}
        {product.isArchived ? " · archived, not on the shop" : ""}
      </p>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
