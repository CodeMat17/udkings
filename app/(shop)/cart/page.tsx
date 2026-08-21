import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const categories = await getCategories();
  return (
    <CartView
      categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
    />
  );
}
