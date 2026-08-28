import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { listCategories } from "../../../actions";

export const metadata: Metadata = {
  title: "Edit section",
  robots: { index: false, follow: false },
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/admin/categories"
        className="label text-muted-foreground hover:text-foreground"
      >
        ← Sections
      </Link>
      <h1 className="display mt-1 text-3xl">{category.name}</h1>
      <CategoryForm category={category} />
    </div>
  );
}
