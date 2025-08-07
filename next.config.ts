import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'www.instacart.com',
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
