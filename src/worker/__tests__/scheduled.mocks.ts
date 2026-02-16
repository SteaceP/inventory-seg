import { vi, type Mock } from "vitest";

import type { Env } from "../types";

// These mocks are shared state
export const mockSql = vi.fn();

// The mock needs to be a function that returns a promise
// It also needs to handle the template literal syntax: sql`...`
export const mockPostgresClient = vi.fn((...args: unknown[]) => {
  // If it's called as a template tag (array of strings as first arg)
  if (Array.isArray(args[0])) {
    return mockSql(...args) as Promise<unknown[]>;
  }
  return mockSql;
}) as unknown as ReturnType<typeof vi.fn> & { end: () => Promise<void> };

mockPostgresClient.end = vi.fn().mockResolvedValue(undefined);

export const createMockEnv = (): Env =>
  ({
    SUPABASE_URL: "mock-url",
    SUPABASE_SECRET_KEY: "mock-secret-key",
    VAPID_PUBLIC_KEY: "mock-vapid-public",
    VAPID_PRIVATE_KEY: "mock-vapid-private",
    BREVO_API_KEY: "mock-brevo",
    BREVO_SENDER_EMAIL: "mock@test.com",
    SENTRY_DSN: "mock-dsn",
    APP_URL: "http://localhost",
    ALLOWED_ORIGIN: "http://localhost",
    HYPERDRIVE: { connectionString: "postgres://mock" },
    DB: {} as D1Database,
    AI_SERVICE: {
      run: vi.fn(),
    } as unknown as Ai,
  }) as unknown as Env;

export const createMockCtx = (): ExecutionContext & { waitUntil: Mock } =>
  ({
    waitUntil: vi.fn((promise: Promise<unknown>) => {
      return promise;
    }),
    passThroughOnException: vi.fn(),
  }) as unknown as ExecutionContext & { waitUntil: Mock };
