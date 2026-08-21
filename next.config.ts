import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Photographs uploaded through the admin live in Convex file storage; the
    // seeded ones are still local files. Both have to be renderable.
    remotePatterns: [
      { protocol: 'https', hostname: '*.convex.cloud', pathname: '/api/storage/**' },
    ],
    // Keep the srcset lean for 3G phones.
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 14400,
  },
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
