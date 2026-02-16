import * as Sentry from "@sentry/cloudflare";

import { getSecurityHeaders } from "./worker/helpers";
import {
  handleActivityLogPost,
  handleActivityLogGet,
  handleDashboardStats,
  handleReportStats,
  handleTestPush,
  handleLowStockAlert,
  handleAssistantChat,
} from "./worker/routes";
import { handleScheduled } from "./worker/scheduled";

import type { Env } from "./worker/types";

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    sendDefaultPii: true,
  }),
  {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);

      // Instrument D1 with Sentry
      const db = Sentry.instrumentD1WithSentry(env.DB);
      const instrumentedEnv = { ...env, DB: db };

      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        const origin = request.headers.get("Origin") || "";
        const allowedOrigins = [env.ALLOWED_ORIGIN, env.APP_URL].filter(
          Boolean
        );

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
        return handleActivityLogPost(request, instrumentedEnv);
      }

      if (url.pathname === "/api/activity" && request.method === "GET") {
        return handleActivityLogGet(request, instrumentedEnv);
      }

      if (
        url.pathname === "/api/activity/dashboard-stats" &&
        request.method === "GET"
      ) {
        return handleDashboardStats(request, instrumentedEnv);
      }

      if (
        url.pathname === "/api/activity/report-stats" &&
        request.method === "GET"
      ) {
        return handleReportStats(request, instrumentedEnv);
      }

      if (url.pathname === "/api/send-test-push" && request.method === "POST") {
        return handleTestPush(request, instrumentedEnv);
      }

      if (
        url.pathname === "/api/send-low-stock-alert" &&
        request.method === "POST"
      ) {
        return handleLowStockAlert(request, instrumentedEnv);
      }

      if (url.pathname === "/api/assistant/chat" && request.method === "POST") {
        return handleAssistantChat(request, instrumentedEnv);
      }

      // For non-API routes, return null to let the Vite plugin's
      // automatic asset handling take over (via run_worker_first + not_found_handling config)
      return new Response("Not Found", { status: 404 });
    },

    scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): void {
      const db = Sentry.instrumentD1WithSentry(env.DB);
      const instrumentedEnv = { ...env, DB: db };
      handleScheduled(event, instrumentedEnv, ctx);
    },
  } satisfies ExportedHandler<Env>
);
