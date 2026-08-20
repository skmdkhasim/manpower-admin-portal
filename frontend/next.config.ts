import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle in .next/standalone —
  // keeps the production Docker image small and dependency-free. Only
  // needed for the self-hosted Docker build (Render/VPS); Vercel has its
  // own optimized build/output pipeline and errors if this is set, since
  // it changes how Next.js's build tracing works. Vercel always sets the
  // VERCEL env var during its builds, so skip it there.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
