import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
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
  plugins: [
    react(),
    basicSsl(),
    cloudflare({
      // Automatically use wrangler.jsonc for configuration
      configPath: "./wrangler.jsonc",
      // Enable persistent storage for D1 and other bindings during dev
      persistState: true,
    }),
    sentryVitePlugin({
      org: "coderage",
      project: "seg-inv-frontend",
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "mui-core": ["@mui/material"],
          "mui-icons": ["@mui/icons-material"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "sentry-vendor": ["@sentry/react"],
          "scanner-vendor": ["html5-qrcode"],
          "framer-vendor": ["framer-motion"],
        },
      },
    },

    sourcemap: true,
  },
});
