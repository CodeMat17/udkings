import type { Metadata } from "next";

/**
 * The admin shell is deliberately bare: no storefront header, no footer, no
 * bottom nav, no catalogue. Nothing here should ever be indexed or prefetched.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <main id="main" className="min-h-svh bg-background">
      {children}
    </main>
  );
}
