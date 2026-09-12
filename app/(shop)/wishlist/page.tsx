import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { SavedView } from "@/components/product/saved-view";

export const metadata: Metadata = {
  title: "Saved pieces",
  robots: { index: false, follow: true },
};

/** A static shell; saved pieces live in the browser. */
export default function WishlistPage() {
  return (
    <>
      <PageIntro eyebrow="Your edit" title="Saved for later" />
      <div className="shell">
        <SavedView />
      </div>
    </>
  );
}
