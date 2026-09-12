import type { NextConfig } from "next";

/** Static headers, served by the CDN — no per-request proxy needed. */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Uploaded photographs live in Convex storage; seeded ones are local files.
    remotePatterns: [
      { protocol: "https", hostname: "*.convex.cloud", pathname: "/api/storage/**" },
      { protocol: "https", hostname: "*.convex.site", pathname: "/api/storage/**" },
    ],
    // Fewer widths and one format means fewer optimisation jobs to pay for.
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [96, 160, 256, 384],
    formats: ["image/webp"],
    // A Convex storage URL never changes content (a new upload is a new URL),
    // so an optimised image can be cached for a month.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Routes from the old checkout flow, kept so shared links still land somewhere useful.
    return [
      { source: "/search", destination: "/shop", permanent: true },
      { source: "/checkout", destination: "/cart", permanent: true },
      { source: "/track", destination: "/contact", permanent: true },
      { source: "/order/:orderNumber", destination: "/contact", permanent: true },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
