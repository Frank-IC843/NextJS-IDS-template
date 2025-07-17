import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
    ],
  },
  compiler: {
    emotion: true,
  },
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
