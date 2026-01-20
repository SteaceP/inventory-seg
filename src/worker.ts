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

      // Default: fall back to static assets
      const response = await env.ASSETS.fetch(request);

      // If the asset is not found (404) and it's a navigation request, serve index.html
      if (
        (response.status === 404 || response.status === 403) &&
        request.method === "GET" &&
        request.headers.get("accept")?.includes("text/html")
      ) {
        const indexRequest = new Request(url.origin + "/index.html", request);
        return env.ASSETS.fetch(indexRequest);
      }

      return response;
    },
  } satisfies ExportedHandler<Env>
);
