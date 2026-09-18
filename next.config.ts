import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone — the self-contained server bundle the Dockerfile copies into the
  // runtime image. Without this, `.next/standalone` never exists and the Docker build fails.
  output: "standalone",
  // /api/* is handled by src/app/api/[...path]/route.ts, a same-origin proxy to the real API —
  // see that file for why it's a Route Handler rather than a rewrites() entry (Origin header).
  // Top-level as of Next 16 — it used to live under `experimental`, and leaving it there now
  // fails the type check outright, not just with a warning.
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
