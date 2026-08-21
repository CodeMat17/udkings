import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/cart", "/order"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
