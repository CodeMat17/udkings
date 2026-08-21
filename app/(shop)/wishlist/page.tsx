import type { Metadata } from "next";
import { WishlistView } from "@/components/product/wishlist-view";
import { getCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Your wishlist",
  description:
    "The pieces you have saved at UDKING'S Collections. Send the whole list to us on WhatsApp and ask what is still in stock in your size.",
  alternates: { canonical: "/wishlist" },
};

export default async function WishlistPage() {
  const categories = await getCategories();
  return (
    <div className="shell py-10">
      <p className="label text-accent-ink">Saved for later</p>
      <h1 className="display mt-2 text-[length:var(--text-display-l)]">
        Your wishlist
      </h1>
      <WishlistView
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
    </div>
  );
}
