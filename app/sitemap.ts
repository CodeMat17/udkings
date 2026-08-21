import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/business";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [CATEGORIES, PRODUCTS] = await Promise.all([getCategories(), getProducts()]);
  const now = new Date();

  const statics = [
    "",
    "/shop",
    "/shop/new",
    "/shop/best-sellers",
    "/categories",
    "/visit-us",
    "/about",
    "/contact",
    "/delivery",
    "/faq",
    "/track",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const categories = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const products = PRODUCTS.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...statics, ...categories, ...products];
}
