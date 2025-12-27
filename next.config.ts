import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const turbopackRoot = (() => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    // Fallback: al menos respeta el cwd del proceso
    return process.cwd();
  }
})();

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
