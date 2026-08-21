import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { nunito } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UDKING'S Collections — Ladies Wear, Lagos Island",
    template: "%s | UDKING'S Collections",
  },
  description:
    "Ladies' jeans, tops, gowns and two-piece sets from Andora Plaza, Lagos Island. Retail and wholesale from the same catalogue, ordered on WhatsApp.",
  applicationName: BUSINESS.name,
  keywords: [
    "ladies wear Lagos Island",
    "women's clothing Lagos",
    "wholesale ladies wear Lagos",
    "wholesale clothes Lagos Island",
    "jeans wholesale Lagos",
    "ladies jeans Lagos",
    "gowns Lagos",
    "bump shorts Lagos",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: BUSINESS.name,
    url: SITE_URL,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1F0EC" },
    { media: "(prefers-color-scheme: dark)", color: "#10132B" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
