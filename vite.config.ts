import fs from "fs";
import os from "os";
import path from "path";

import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import UnpluginFonts from "unplugin-fonts/vite";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";

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
        let value = trimmed.slice(colonIndex + 1).trim();

        // Replace placeholders (mimic build-time plugin)
        const env = loadEnv(mode, process.cwd(), "");
        value = value
          .replace(/%VITE_APP_URL%/g, env.VITE_APP_URL || "")
          .replace(/%VITE_WORKER_URL%/g, env.VITE_WORKER_URL || "");

        headers[key] = value;
      }
    });

    if (mode === "development" && headers["Content-Security-Policy"]) {
      console.log("Relaxing CSP for development mode");
      let csp = headers["Content-Security-Policy"];

      // Relax connect-src
      if (csp.includes("connect-src")) {
        csp = csp.replace(
          /connect-src\s+([^;]+)/,
          "connect-src $1 http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*"
        );
      }

      // Relax img-src
      if (csp.includes("img-src")) {
        csp = csp.replace(
          /img-src\s+([^;]+)/,
          "img-src $1 http://localhost:* http://127.0.0.1:*"
        );
      }

      // Relax script-src
      if (csp.includes("script-src")) {
        csp = csp.replace(
          /script-src\s+([^;]+)/,
          "script-src $1 'unsafe-eval' http://localhost:* http://127.0.0.1:*"
        );
      }

      headers["Content-Security-Policy"] = csp;
      console.log("Updated CSP:", headers["Content-Security-Policy"]);
    }

    return headers;
  } catch (e) {
    console.warn("Failed to read public/_headers", e);
    return {};
  }
};

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const isBuild = mode === "production";
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      cors: isDev
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
      {
        name: "html-env-transform",
        transformIndexHtml(html: string) {
          return html
            .replace(
              /%VITE_APP_NAME%/g,
              env.VITE_APP_NAME || "Inventory System"
            )
            .replace(/%VITE_COMPANY_URL%/g, env.VITE_COMPANY_URL || "")
            .replace(/%VITE_COMPANY_NAME%/g, env.VITE_COMPANY_NAME || "");
        },
      },
      {
        name: "headers-env-transform",
        apply: "build",
        closeBundle() {
          const headersPath = path.resolve(__dirname, "dist/client/_headers");
          if (fs.existsSync(headersPath)) {
            let content = fs.readFileSync(headersPath, "utf-8");
            content = content
              .replace(/%VITE_APP_URL%/g, env.VITE_APP_URL || "")
              .replace(/%VITE_WORKER_URL%/g, env.VITE_WORKER_URL || "");
            fs.writeFileSync(headersPath, content);
            console.log("Transformed dist/client/_headers with env vars");
          }
        },
      },
      react(),

      cloudflare({
        configPath: "./wrangler.toml",
        persistState: true,
        remoteBindings:
          !process.env.VITE_TEST &&
          !process.env.NO_MKCERT &&
          env.AI_REMOTE !== "false",
      }),

      // Only run Sentry upload on production builds
      ...(isBuild
        ? [
            sentryVitePlugin({
              org: "coderage",
              project: "seg-inv-frontend",
              telemetry: false,
              // Only upload source maps, don't block build
              sourcemaps: {
                assets: "./dist/**",
              },
            }),
            sentryVitePlugin({
              org: "coderage",
              project: "seg-inv-backend",
              telemetry: false,
              sourcemaps: {
                assets: "./dist/**",
              },
            }),
          ]
        : []),

      // Bundle analyzer - only in production builds
      ...(isBuild
        ? [
            visualizer({
              filename: "./dist/stats.html",
              open: false,
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),

      svgr(),

      // HTTPS cert for development only
      ...(isDev && !process.env.NO_MKCERT && !process.env.VITE_TEST
        ? [mkcert()]
        : []),

      // Font loading - only in production builds
      // In dev, fonts load from CDN directly
      ...(isBuild
        ? [
            UnpluginFonts({
              google: {
                families: [
                  {
                    name: "Inter",
                    styles: "wght@400;500;600;700;800",
                  },
                  {
                    name: "Roboto",
                    styles: "wght@400;500;700",
                  },
                ],
              },
            }),
          ]
        : []),

      // Image optimization - only in production builds
      ...(isBuild
        ? [
            ViteImageOptimizer({
              svg: {
                multipass: true,
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      overrides: {
                        // Remove most default plugins but keep essential ones
                        cleanupIds: false,
                      },
                    },
                  },
                  "sortAttrs",
                  {
                    name: "addAttributesToSVGElement",
                    params: {
                      attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                    },
                  },
                ],
              },
              png: { quality: 80 },
              jpeg: { quality: 80 },
              webp: { quality: 80 },
            }),
          ]
        : []),

      // PWA - only in production builds
      ...(isBuild
        ? [
            VitePWA({
              registerType: "autoUpdate",
              strategies: "injectManifest",
              srcDir: "src",
              filename: "sw.ts",
              injectRegister: false,
              manifest: {
                name: "SEG Inventaire",
                short_name: "Inventaire",
                description: "Système de gestion d'inventaire moderne",
                theme_color: "#027d6f",
                background_color: "#0d1117",
                display: "standalone",
                start_url: "/",
                icons: [
                  {
                    src: "icons/icon.svg",
                    sizes: "any",
                    type: "image/svg+xml",
                    purpose: "any",
                  },
                  {
                    src: "icons/icon_maskable.svg",
                    sizes: "any",
                    type: "image/svg+xml",
                    purpose: "maskable",
                  },
                ],
              },
              devOptions: {
                enabled: false,
                type: "module",
              },
            }),
          ]
        : []),
    ] as PluginOption[],
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

      // Warn if chunks exceed 400KB
      chunkSizeWarningLimit: 400,

      sourcemap: true,

      minify: "terser",
      terserOptions: {
        maxWorkers: Math.max(1, os.cpus().length - 1), // Utilize all available CPU cores minus 1 for the main thread
        compress: {
          drop_console: false, // We keep console logs for Cloudflare Workers
          drop_debugger: true,
          passes: 3,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      target: "es2020",
    },
  };
});
