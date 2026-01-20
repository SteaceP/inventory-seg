/**
 * Response and security helper utilities for the Cloudflare Worker
 */

interface Env {
  ALLOWED_ORIGIN?: string;
}

/**
 * Returns security headers for responses
 */
export function getSecurityHeaders(
  origin: string = "*"
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none';",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  };
}

/**
 * Creates a standardized JSON response with security headers
 */
export function createResponse(
  body: string | object,
  status: number = 200,
  env: Env,
  request: Request
): Response {
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

  const headers: Record<string, string> = {
    ...getSecurityHeaders(finalOrigin),
    "Content-Type": "application/json",
  };

  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers,
  });
}
