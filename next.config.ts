import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Verification builds write somewhere else so they cannot collide with a
   * running `next dev`, which shares .next and dies when a build stomps on it.
   * `npm run verify` sets this; nothing else needs to.
   */
  distDir: process.env.BUILD_DIR ?? ".next",
};

export default nextConfig;
