/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

import { handleScheduled } from "../scheduled";
import {
  mockSql,
  mockPostgresClient,
  createMockEnv,
  createMockCtx,
} from "./scheduled.mocks";

import type { Env } from "../types";

vi.mock("postgres", () => ({
  default: vi.fn(() => mockPostgresClient),
}));

vi.mock("web-push", () => ({
  default: {
    sendNotification: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../errorReporting", () => ({
  reportError: vi.fn(),
}));

describe("handleScheduled - Base Flow", () => {
  let env: Env;
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockResolvedValue([]);
    env = createMockEnv();
    ctx = createMockCtx();
  });

  it("should do nothing if no low stock items", async () => {
    // Mock History (ActivityRow[])
    mockSql.mockResolvedValueOnce([]);
    // Mock Current Items (InventoryItemRow[])
    mockSql.mockResolvedValueOnce([
      {
        id: "1",
        name: "High Stock Item",
        category: "General",
        stock: 100,
        low_stock_threshold: 10,
        category_threshold: 10,
      },
    ]);

    handleScheduled(
      {
        cron: "* * * * *",
        type: "scheduled",
        scheduledTime: Date.now(),
      } as unknown as ScheduledEvent,
      env,
      ctx
    );

    // Await the promise passed to waitUntil
    const work = ctx.waitUntil.mock.results[0].value as Promise<void>;
    await work;

    // Should fetch history and current items
    expect(mockSql).toHaveBeenCalledTimes(2);
    // Should NOT call AI
    const aiRunSpy = env.AI_SERVICE.run as Mock;
    expect(aiRunSpy).not.toHaveBeenCalled();
    // Should NOT send notifications
    const webpush = await import("web-push");
    expect(webpush.default.sendNotification as Mock).not.toHaveBeenCalled();
  });
});
