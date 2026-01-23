import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    // Pool for Cloudflare Workers
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          assets: {
            directory: "./public",
          },
        },
      },
    },

    // Include only worker test files
    include: ["src/worker/**/*.{test,spec}.{ts,tsx}"],

    // Exclude non-worker tests
    exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],

    // Enable globals
    globals: true,
  },
});
