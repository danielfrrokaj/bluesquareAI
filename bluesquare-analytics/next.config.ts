import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: { root: path.resolve(__dirname) },
  poweredByHeader: false,
  // Lead imports send up to ~2 MB of pasted text or CSV.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // Native/WASM and data-file packages are loaded from node_modules at runtime.
  serverExternalPackages: ["@electric-sql/pglite", "maxmind", "pg"],
  outputFileTracingIncludes: {
    "/api/collect": ["./node_modules/@ip-location-db/dbip-country-mmdb/dbip-country.mmdb"],
  },
  async headers() {
    return [
      {
        source: "/t.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
