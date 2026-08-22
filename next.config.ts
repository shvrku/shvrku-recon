import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three", "lenis"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [75, 85],
  },
  async redirects() {
    return [
      {
        source: "/work/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
      {
        source: "/og-preview",
        destination: "/live-previews",
        permanent: false,
      },
    ];
  },
  agentRules: false,
  allowedDevOrigins: ['192.168.1.6'],
};

export default nextConfig;
