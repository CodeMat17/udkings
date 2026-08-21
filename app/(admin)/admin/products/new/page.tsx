import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Add a piece",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/admin/products" className="label text-muted-foreground hover:text-foreground">
        ← Products
      </Link>
      <h1 className="display mt-1 text-3xl">Add a piece</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
