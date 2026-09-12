import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { BUSINESS, SITE_URL } from "@/lib/business";
import { displayFont, uiFont } from "./fonts";
import "./globals.css";

const DESCRIPTION =
  "Ladies' gowns, jeans, tops and two-piece sets from Andora Plaza, Lagos Island. Retail and wholesale from one catalogue, ordered on WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UDKING'S Collections — Ladies Wear, Lagos Island",
    template: "%s | UDKING'S Collections",
  },
  description: DESCRIPTION,
  applicationName: BUSINESS.name,
  keywords: [
    "ladies wear Lagos Island",
    "women's clothing Lagos",
    "wholesale ladies wear Lagos",
    "wholesale clothes Lagos Island",
    "jeans wholesale Lagos",
    "gowns Lagos",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: BUSINESS.name,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "UDKING'S Collections — Ladies Wear, Lagos Island",
    description: DESCRIPTION,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F3EE" },
    { media: "(prefers-color-scheme: dark)", color: "#131110" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${uiFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
