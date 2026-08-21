import { Nunito } from "next/font/google";

/**
 * One family only — Nunito. Every extra family is another render-blocking
 * asset on a 3G phone. The display voice is Nunito 900 with tight tracking;
 * the utility voice is Nunito 800 uppercase, wide.
 */
export const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800", "900"],
});
