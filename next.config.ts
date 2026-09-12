import type { NextConfig } from 'next';

/**
 * `next dev` and `next build` share an output directory by default, so running
 * a build while the dev server is up rewrites the chunks underneath it and the
 * running app dies with errors like "__webpack_modules__[moduleId] is not a
 * function". Verification builds set NEXT_DIST_DIR to write somewhere else.
 */
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
};

export default nextConfig;
