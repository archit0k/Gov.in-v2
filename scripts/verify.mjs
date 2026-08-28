/**
 * Verification build.
 *
 * `next build` and `next dev` share .next, and building while the dev server
 * is running kills it. This builds into its own directory so the two never
 * touch, which matters when someone is about to record a demo.
 */
import { execSync } from "node:child_process";

execSync("next build", {
  stdio: "inherit",
  env: { ...process.env, BUILD_DIR: ".next-verify" },
});
