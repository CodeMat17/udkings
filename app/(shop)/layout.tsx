import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SkipLink } from "@/components/layout/skip-link";
import { InstallPrompt } from "@/components/layout/install-prompt";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SkipLink />
      <Header />
      {/* Bottom nav is fixed, so reserve its height rather than let it overlap. */}
      <main id="main" className="flex-1 pb-24 lg:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <InstallPrompt />
    </>
  );
}
