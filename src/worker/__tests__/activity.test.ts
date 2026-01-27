/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleActivityLogPost,
  handleActivityLogGet,
} from "../handlers/activity";
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

describe("Activity Route Handlers", () => {
  let env: Env;
  let request: Request;

  beforeEach(() => {
    vi.clearAllMocks();

    env = {
      DB: {
        prepare: vi.fn().mockReturnValue({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
            all: vi.fn().mockResolvedValue({ results: [] }),
            first: vi.fn().mockResolvedValue(null),
          }),
        }),
      } as unknown as D1Database,
      HYPERDRIVE: { connectionString: "postgres://mock" },
    } as unknown as Env;
  });

  describe("handleActivityLogPost", () => {
    it("should create activity log entry", async () => {
      const body = {
        inventory_id: "123",
        user_id: "user1",
        action: "created",
        item_name: "Test Item",
        changes: { stock: 10 },
      };

      request = {
        json: vi.fn().mockResolvedValue(body),
      } as unknown as Request;

      await handleActivityLogPost(request, env);

      const prepareSpy = env.DB.prepare as unknown as ReturnType<typeof vi.fn>;
      expect(prepareSpy).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO inventory_activity")
      );
      expect(createResponse).toHaveBeenCalledWith(
        expect.objectContaining({ success: true }),
        201,
        env,
        request
      );
    });
  });

  describe("handleActivityLogGet", () => {
    it("should fetch activity logs with filters", async () => {
      request = {
        url: "http://localhost/api/activity?page=0&pageSize=10&actionFilter=created",
      } as unknown as Request;

      await handleActivityLogGet(request, env);

      const prepareSpy = env.DB.prepare as unknown as ReturnType<typeof vi.fn>;
      expect(prepareSpy).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM inventory_activity")
      );
      expect(prepareSpy).toHaveBeenCalledWith(
        expect.stringContaining("AND action = ?")
      );
      expect(createResponse).toHaveBeenCalledWith(
        expect.any(Array),
        200,
        env,
        request
      );
    });
  });
});
