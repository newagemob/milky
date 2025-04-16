import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages uses a repo name as a base path by default
  // Change this to match your GitHub repo name
  basePath: process.env.NODE_ENV === 'production' ? '/milky' : '',
  images: {
    unoptimized: true,
  },
  // Disable server side features for static export
  trailingSlash: true,
};

export default nextConfig;
