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

describe("handleScheduled - BOD Supplier", () => {
  let env: Env;
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockResolvedValue([]);
    env = createMockEnv();
    ctx = createMockCtx();
  });

  it("should query AI for B.O.D. items and notify if AI says yes", async () => {
    const bodItem = {
      id: "2",
      name: "#BOD Item",
      category: "Entretien",
      stock: 5,
      low_stock_threshold: 10,
      category_threshold: null,
    };

    const historyMock = [
      {
        inventory_id: "2",
        item_name: "#BOD Item",
        category: "Entretien",
        created_at: "2023-01-01",
        changes: { old_stock: 2, stock: 20 },
        action: "updated",
      },
    ];

    // 1. History
    mockSql.mockResolvedValueOnce(historyMock);
    // 2. Current Items
    mockSql.mockResolvedValueOnce([bodItem]);
    // 3. Subscriptions (called later)
    mockSql.mockResolvedValueOnce([
      { subscription: { endpoint: "test" }, user_id: "u1" },
    ]);

    // Mock AI Response
    const aiResponse = {
      response: JSON.stringify({ should_order: true, reason: "Order now" }),
    };
    (env.AI_SERVICE.run as Mock).mockResolvedValue(aiResponse);

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
    expect(aiRunSpy).toHaveBeenCalledWith(
      "@cf/meta/llama-3-8b-instruct",
      expect.anything()
    );

    const webpush = await import("web-push");
    // Should notify because AI said yes
    expect(webpush.default.sendNotification as Mock).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("Order now"),
      expect.anything()
    );
  });

  it("should NOT notify for B.O.D. items if AI says no", async () => {
    const bodItem = {
      id: "2",
      name: "#BOD Item",
      category: "Entretien",
      stock: 5,
      low_stock_threshold: 10,
      category_threshold: null,
    };

    // 1. History
    mockSql.mockResolvedValueOnce([]);
    // 2. Current Items
    mockSql.mockResolvedValueOnce([bodItem]);

    // Mock AI Response
    const aiResponse = {
      response: JSON.stringify({ should_order: false, reason: "Wait more" }),
    };
    (env.AI_SERVICE.run as Mock).mockResolvedValue(aiResponse);

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
    expect(aiRunSpy).toHaveBeenCalled();

    const webpush = await import("web-push");
    expect(webpush.default.sendNotification as Mock).not.toHaveBeenCalled();
  });
});
