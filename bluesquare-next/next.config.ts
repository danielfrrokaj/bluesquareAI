import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Cloud Run image (see Dockerfile).
  output: "standalone",
  // Keep this app independent of the older site in the parent folder.
  turbopack: { root: path.resolve(__dirname) },
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Lets the English and Albanian route groups each have their own root layout
    // (correct <html lang>) while sharing one 404 page.
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|png|jpg|ico|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
