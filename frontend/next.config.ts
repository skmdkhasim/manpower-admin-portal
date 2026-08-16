import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle in .next/standalone —
  // keeps the production Docker image small and dependency-free.
  output: "standalone",
};

export default nextConfig;
