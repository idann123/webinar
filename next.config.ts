import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan akses dev server lewat proxy Laragon (http://webinar.test)
  allowedDevOrigins: ["webinar.test", "*.webinar.test"],
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;