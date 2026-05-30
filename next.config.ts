import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    ppr: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.vercel-storage.com" },
      { protocol: "https", hostname: "**.mux.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "profile.line-scdn.net" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  // Packages that must run in Node.js runtime (not Edge)
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default withNextIntl(nextConfig);
