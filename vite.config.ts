import path from "path";
import fs from "fs";
import react from "@vitejs/plugin-react-swc";
import { checker } from "vite-plugin-checker";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
const getCloudflareHeaders = (mode: string) => {
  try {
    const headersPath = path.resolve(__dirname, "public/_headers");
    if (!fs.existsSync(headersPath)) return {};

    const content = fs.readFileSync(headersPath, "utf-8");
    const headers: Record<string, string> = {};

    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("/*"))
        return;

      const colonIndex = trimmed.indexOf(":");
      if (colonIndex > -1) {
        const key = trimmed.slice(0, colonIndex).trim();
        const value = trimmed.slice(colonIndex + 1).trim();
        headers[key] = value;
      }
    });

    if (mode === "development" && headers["Content-Security-Policy"]) {
      // Relax CSP for local development
      headers["Content-Security-Policy"] = headers["Content-Security-Policy"]
        .replace(
          "connect-src ",
          "connect-src http://localhost:* ws://localhost:* "
        )
        .replace("img-src ", "img-src http://localhost:* ")
        .replace("script-src ", "script-src 'unsafe-eval' http://localhost:* ");
    }

    return headers;
  } catch (e) {
    console.warn("Failed to read public/_headers", e);
    return {};
  }
};

export default defineConfig(({ mode }) => ({
  server: {
    cors:
      mode === "development"
        ? {
            origin: [/^http:\/\/localhost:\d+$/],
            credentials: true,
          }
        : true,
    headers: getCloudflareHeaders(mode),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@locales": path.resolve(__dirname, "src/locales"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@supabaseClient": path.resolve(__dirname, "src/supabaseClient"),
      "@test": path.resolve(__dirname, "src/test"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
  plugins: [
    react(),
    checker({
      typescript: {
        tsconfigPath: "./tsconfig.app.json",
      },
      eslint: {
        lintCommand: "eslint .",
        useFlatConfig: true,
      },
    }),
    cloudflare({
      // Automatically use wrangler.jsonc for configuration
      configPath: "./wrangler.jsonc",
      // Enable persistent storage for D1 and other bindings during dev
      persistState: true,
    }),
    sentryVitePlugin({
      org: "coderage",
      project: "seg-inv-frontend",
      telemetry: false,
    }),
    sentryVitePlugin({
      org: "coderage",
      project: "seg-inv-backend",
      telemetry: false,
    }),
    // Bundle analyzer - generates stats.html in dist
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  optimizeDeps: {
    include: ["@emotion/react", "@emotion/styled", "@mui/material/Tooltip"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          // Emotion styling
          emotion: ["@emotion/react", "@emotion/styled"],

          // MUI - keep as single chunk to avoid circular dependencies
          // Splitting MUI components causes circular chunk warnings because
          // components like Dialog, TextField, etc. import from each other
          "mui-vendor": ["@mui/material"],

          // Icons - keep separate as they're large
          "mui-icons": ["@mui/icons-material"],

          // Backend services
          "supabase-vendor": ["@supabase/supabase-js"],
          "sentry-vendor": ["@sentry/react"],

          // Heavy libraries - lazy loaded via dynamic imports
          "scanner-vendor": ["@zxing/library"],
          "barcode-vendor": ["react-barcode"],

          // Animation
          "framer-vendor": ["framer-motion"],
        },
      },
    },

    // Warn if chunks exceed 500KB
    chunkSizeWarningLimit: 400,

    sourcemap: true,

    // Minify for production
    minify: "terser",
    target: "es2015",
  },
}));
