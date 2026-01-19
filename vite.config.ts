import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
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
