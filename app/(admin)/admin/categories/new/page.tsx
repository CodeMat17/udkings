import type { Metadata } from "next";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = {
  title: "Add a section",
  robots: { index: false, follow: false },
};

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/admin/categories"
        className="label text-muted-foreground hover:text-foreground"
      >
        ← Sections
      </Link>
      <h1 className="display mt-1 text-3xl">Add a section</h1>
      <CategoryForm />
    </div>
  );
}
