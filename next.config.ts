import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed "output: export" to support API routes
  // API routes require server-side rendering
  images: {
    unoptimized: true
  },
  // Turbopack configuration for Next.js 16+
  turbopack: {
    rules: {
      '*.txt': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;