/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleActivityLogPost,
  handleActivityLogGet,
  handleDashboardStats,
  handleReportStats,
} from "../routes";
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

describe("Worker Routes", () => {
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

  describe("handleDashboardStats", () => {
    it("should calculate stock in/out", async () => {
      request = {
        url: "http://localhost/api/stats/dashboard",
      } as unknown as Request;

      const mockData = [
        {
          action: "created",
          changes: JSON.stringify({ stock: 10 }),
        },
        {
          action: "deleted",
          changes: JSON.stringify({ stock: 5 }),
        },
      ];

      (
        env.DB.prepare("").bind("").all as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ results: mockData });

      await handleDashboardStats(request, env);

      expect(createResponse).toHaveBeenCalledWith(
        { in: 10, out: 5 },
        200,
        env,
        request
      );
    });
  });

  describe("handleReportStats", () => {
    it("should aggregate removal stats", async () => {
      request = {
        url: "http://localhost/api/reports?startDate=2023-01-01&endDate=2023-02-01",
      } as unknown as Request;

      const mockData = [
        {
          item_name: "Item A",
          changes: JSON.stringify({ old_stock: 10, stock: 5 }), // Removed 5
        },
        {
          item_name: "Item A",
          changes: JSON.stringify({ old_stock: 5, stock: 0 }), // Removed 5
        },
        {
          item_name: "Item B",
          changes: JSON.stringify({ old_stock: 20, stock: 19 }), // Removed 1
        },
      ];

      (
        env.DB.prepare("").bind("").all as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ results: mockData });

      await handleReportStats(request, env);

      expect(createResponse).toHaveBeenCalledWith(
        [
          { itemName: "Item A", total: 10 },
          { itemName: "Item B", total: 1 },
        ],
        200,
        env,
        request
      );
    });
  });
});
