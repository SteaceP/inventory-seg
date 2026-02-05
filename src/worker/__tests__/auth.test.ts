// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { verifyAuth } from "../auth";

import type { Ai } from "@cloudflare/workers-types";

describe("worker/auth", () => {
  const mockEnv = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SECRET_KEY: "secret-key",
    BREVO_API_KEY: "test-key",
    BREVO_SENDER_EMAIL: "test@example.com",
    VAPID_PUBLIC_KEY: "test-public-key",
    VAPID_PRIVATE_KEY: "test-private-key",
    SENTRY_DSN: "https://test@sentry.io/123",
    fetch: global.fetch,
    HYPERDRIVE: { connectionString: "test" },
    DB: {} as D1Database,
    AI_SERVICE: {} as Ai,
  } as const;

  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return false if Authorization header is missing", async () => {
    const request = new Request("https://api.example.com");
    const result = await verifyAuth(request, mockEnv);
    expect(result).toBe(false);
  });

  it("should return false if Authorization header is not Bearer", async () => {
    const request = new Request("https://api.example.com", {
      headers: { Authorization: "Basic user:pass" },
    });
    const result = await verifyAuth(request, mockEnv);
    expect(result).toBe(false);
  });

  it("should return true if Supabase returns ok", async () => {
    const request = new Request("https://api.example.com", {
      headers: { Authorization: "Bearer valid-token" },
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
    });

    const result = await verifyAuth(request, mockEnv);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/user",
      expect.objectContaining({
        headers: {
          apikey: "secret-key",
          Authorization: "Bearer valid-token",
        },
      })
    );
    expect(result).toBe(true);
  });

  it("should return false if Supabase returns not ok", async () => {
    const request = new Request("https://api.example.com", {
      headers: { Authorization: "Bearer invalid-token" },
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    const result = await verifyAuth(request, mockEnv);
    expect(result).toBe(false);
  });

  it("should return false if fetch fails", async () => {
    const request = new Request("https://api.example.com", {
      headers: { Authorization: "Bearer token" },
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error")
    );

    const result = await verifyAuth(request, mockEnv);
    expect(result).toBe(false);
  });
});
