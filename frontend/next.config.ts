import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = (
      process.env.OPPORBYTE_API_URL || "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
    return [
      { source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` },
    ];
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
