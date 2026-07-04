import type { NextConfig } from "next";

const internalApiURL = process.env.INTERNAL_API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${internalApiURL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
