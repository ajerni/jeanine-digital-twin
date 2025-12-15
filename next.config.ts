import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed "output: export" to support API routes
  // API routes require server-side rendering
  images: {
    unoptimized: true
  }
};

export default nextConfig;