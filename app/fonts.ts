import { Cormorant_Garamond, Manrope } from "next/font/google";

/**
 * Two families, both self-hosted by next/font at build time: a high-contrast
 * serif for the display voice, and a clean grotesque for everything you read
 * or tap.
 */
export const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-serif",
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const uiFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
});
