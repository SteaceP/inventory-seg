import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use happy-dom for a lightweight DOM environment
    environment: "happy-dom",

    // Setup file for global test setup
    setupFiles: ["./src/test/setup.ts"],

    // Include test files
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Exclude worker tests and node_modules
    exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],

    // Enable globals like 'describe', 'it', 'expect'
    globals: true,

    // Test timeouts for CI/CD reliability
    testTimeout: 10000, // 10 seconds per test
    hookTimeout: 10000, // 10 seconds per hook (beforeEach, afterEach)
    teardownTimeout: 10000, // 10 seconds for cleanup

    // Parallelization for faster test execution
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false, // Enable parallel test execution
        isolate: true, // Isolate test contexts for safety
      },
    },

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/**",
        "src/main.tsx",
        "src/worker/**",
      ],
    },
  },
});
