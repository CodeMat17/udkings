import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SkipLink } from "@/components/layout/skip-link";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { BagSheet } from "@/components/bag/bag-sheet";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SkipLink />
      <Header />
      {/* The bottom nav is fixed, so reserve its height rather than overlap. */}
      <main id="main" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <BagSheet />
      <InstallPrompt />
    </>
  );
}
