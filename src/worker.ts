import * as Sentry from "@sentry/cloudflare";
import { getSecurityHeaders } from "./worker/helpers";
import {
  handleActivityLogPost,
  handleActivityLogGet,
  handleDashboardStats,
  handleReportStats,
  handleTestPush,
  handleLowStockAlert,
} from "./worker/routes";
import type { Env } from "./worker/types";

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    sendDefaultPii: true,
  }),
  {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);

      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        const origin = request.headers.get("Origin") || "";
        const allowedOrigins = [
          env.ALLOWED_ORIGIN,
          "https://inv.coderage.pro",
          "https://inventory-seg.pages.dev",
        ].filter(Boolean);

        const finalOrigin =
          allowedOrigins.includes("*") || allowedOrigins.length === 0
            ? "*"
            : allowedOrigins.includes(origin)
              ? origin
              : "null";

        return new Response(null, {
          status: 204,
          headers: getSecurityHeaders(finalOrigin),
        });
      }

      // Route API requests to handlers
      if (url.pathname === "/api/activity" && request.method === "POST") {
        return handleActivityLogPost(request, env);
      }

      if (url.pathname === "/api/activity" && request.method === "GET") {
        return handleActivityLogGet(request, env);
      }

      if (
        url.pathname === "/api/activity/dashboard-stats" &&
        request.method === "GET"
      ) {
        return handleDashboardStats(request, env);
      }

      if (
        url.pathname === "/api/activity/report-stats" &&
        request.method === "GET"
      ) {
        return handleReportStats(request, env);
      }

      if (url.pathname === "/api/send-test-push" && request.method === "POST") {
        return handleTestPush(request, env);
      }

      if (
        url.pathname === "/api/send-low-stock-alert" &&
        request.method === "POST"
      ) {
        return handleLowStockAlert(request, env);
      }

      // For non-API routes, return null to let the Vite plugin's
      // automatic asset handling take over (via run_worker_first + not_found_handling config)
      return new Response("Not Found", { status: 404 });
    },
  } satisfies ExportedHandler<Env>
);
