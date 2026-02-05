import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleTestPush, handleLowStockAlert } from "../handlers/notifications";
import { createResponse } from "../helpers";

import type { Env } from "../types";

// Mock dependencies
const mockSql = vi.fn().mockResolvedValue([]);

// Mock Postgres client setup
const mockPostgresClient = vi.fn((...args: unknown[]) => {
  if (Array.isArray(args[0])) {
    return mockSql(...args) as Promise<unknown[]>;
  }
  return mockSql;
}) as unknown as ReturnType<typeof vi.fn> & { end: () => Promise<void> };

mockPostgresClient.end = vi.fn().mockResolvedValue(undefined);

vi.mock("postgres", () => {
  return {
    default: vi.fn(() => mockPostgresClient),
  };
});

// Mock Auth
vi.mock("../auth", () => ({
  verifyAuth: vi.fn().mockResolvedValue(true),
}));

// Mock Helpers
vi.mock("../helpers", () => ({
  createResponse: vi.fn((data: unknown, status: number) =>
    Promise.resolve({
      json: () => Promise.resolve(data),
      status,
    } as unknown as Response)
  ),
}));

// Mock Notifications
vi.mock("../notifications/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("../notifications/push", () => ({
  broadcastPush: vi.fn().mockResolvedValue({ success: true }),
}));

describe("Notifications Route Handlers", () => {
  let env: Env;
  let request: Request;

  beforeEach(() => {
    vi.clearAllMocks();

    env = {
      HYPERDRIVE: { connectionString: "postgres://mock" },
    } as unknown as Env;
  });

  describe("handleTestPush", () => {
    it("should send a test push notification", async () => {
      const body = { userId: "user123" };
      request = {
        json: vi.fn().mockResolvedValue(body),
      } as unknown as Request;

      await handleTestPush(request, env);

      expect(createResponse).toHaveBeenCalledWith(
        { success: true },
        200,
        env,
        request
      );
    });

    it("should return 400 if userId is missing", async () => {
      request = {
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Request;

      await handleTestPush(request, env);

      expect(createResponse).toHaveBeenCalledWith(
        { error: "Missing userId" },
        400,
        env,
        request
      );
    });
  });

  describe("handleLowStockAlert", () => {
    it("should send low stock notifications", async () => {
      const body = {
        itemName: "Test Item",
        currentStock: 5,
        threshold: 10,
        userEmail: "test@example.com",
        userId: "user123",
      };

      request = {
        json: vi.fn().mockResolvedValue(body),
      } as unknown as Request;

      // Mock SQL for language fetch
      mockSql.mockResolvedValue([{ language: "en" }]);

      await handleLowStockAlert(request, env);

      expect(createResponse).toHaveBeenCalledWith(
        { success: true },
        200,
        env,
        request
      );
    });

    it("should return 400 for invalid inputs", async () => {
      const body = {
        itemName: "", // Invalid
        currentStock: -1, // Invalid
        threshold: 10,
        userId: "user123",
      };

      request = {
        json: vi.fn().mockResolvedValue(body),
      } as unknown as Request;

      await handleLowStockAlert(request, env);

      expect(createResponse).toHaveBeenCalledWith(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({ error: expect.stringMatching(/.+/) }),
        400,
        env,
        request
      );
    });
  });
});
