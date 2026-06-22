import type { NextConfig } from "next";

const standaloneOutput = process.env.NEXT_STANDALONE === "true";

const nextConfig: NextConfig = {
  output: standaloneOutput ? "standalone" : undefined,
  poweredByHeader: false
};

export default nextConfig;
