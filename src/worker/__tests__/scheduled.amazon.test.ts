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

describe("handleScheduled - Amazon Supplier", () => {
  let env: Env;
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockResolvedValue([]);
    env = createMockEnv();
    ctx = createMockCtx();
  });

  it("should notify immediately for Amazon low stock items", async () => {
    const amazonItem = {
      id: "1",
      name: "Amazon Thing",
      category: "General", // Default is Amazon
      stock: 2,
      low_stock_threshold: 5,
      category_threshold: null,
    };

    // 1. History (irrelevant for Amazon but fetched)
    mockSql.mockResolvedValueOnce([]);
    // 2. Current Items
    mockSql.mockResolvedValueOnce([amazonItem]);
    // 3. Subscriptions (called inside sendNotification)
    mockSql.mockResolvedValueOnce([
      { subscription: { endpoint: "test" }, user_id: "u1" },
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

    const aiRunSpy = env.AI_SERVICE.run as Mock;
    expect(aiRunSpy).not.toHaveBeenCalled(); // Amazon skips AI

    const webpush = await import("web-push");
    expect(webpush.default.sendNotification as Mock).toHaveBeenCalledTimes(1);
    expect(webpush.default.sendNotification as Mock).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: "test" }),
      expect.stringContaining("Amazon items (1) can be ordered anytime"),
      expect.anything()
    );
  });
});
