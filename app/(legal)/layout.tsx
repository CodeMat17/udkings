import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SkipLink } from "@/components/layout/skip-link";

export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" className="flex-1 pb-24 lg:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
