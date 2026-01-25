import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import { loadEnv } from "vite";

// Use loadEnv to load from .env and .env.local
const env = loadEnv("", process.cwd(), "");
Object.assign(process.env, env);

// Fallback for D1 Database ID to satisfy TypeScript and provide a default for tests
const D1_DATABASE_ID =
  process.env.D1_DATABASE_ID || "00000000-0000-0000-0000-000000000000";

export default defineWorkersConfig({
  test: {
    // Pool for Cloudflare Workers
    poolOptions: {
      workers: {
        miniflare: {
          watch: false,
          compatibilityDate: "2026-01-02",
          compatibilityFlags: ["nodejs_compat"],
          bindings: {
            SUPABASE_URL: "https://mock.supabase.co",
            VAPID_PUBLIC_KEY: "mock-public",
            BREVO_SENDER_EMAIL: "admin@example.com",
            SENTRY_DSN: "https://mock@sentry.io/123",
          },
          ai: {
            binding: "AI",
          },
          d1Databases: {
            DB: D1_DATABASE_ID,
          },
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
