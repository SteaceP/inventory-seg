import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@i18n": path.resolve(__dirname, "src/i18n"),
      "@locales": path.resolve(__dirname, "src/locales"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@supabaseClient": path.resolve(__dirname, "src/supabaseClient"),
      "@test": path.resolve(__dirname, "src/test"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
  test: {
    // Use happy-dom for a lightweight DOM environment
    environment: "happy-dom",

    // Setup file for global test setup
    setupFiles: ["./src/test/setup.ts"],

    // Include test files
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Exclude worker tests (run with vitest.worker.config.ts) and node_modules
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "src/worker/**",
    ],

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
      clean: true,
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/**",
        "src/main.tsx",
        "src/worker/**",
        ".wrangler/",
        ".agent/",
        "coverage/",
        ".vscode/",
      ],
    },
  },
});
