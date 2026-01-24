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
