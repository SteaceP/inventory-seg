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

describe("handleScheduled - Mixed Suppliers", () => {
  let env: Env;
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockResolvedValue([]);
    env = createMockEnv();
    ctx = createMockCtx();
  });

  it("should handle mixed suppliers correctly", async () => {
    const amazonItem = {
      id: "1",
      name: "A",
      category: "Other",
      stock: 1,
      low_stock_threshold: 5,
      category_threshold: 5,
      user_id: "u1",
    };
    const bodItem = {
      id: "2",
      name: "#B",
      category: "Entretien",
      stock: 1,
      low_stock_threshold: 5,
      category_threshold: 5,
      user_id: "u1",
    };

    // 1. History
    mockSql.mockResolvedValueOnce([]);
    // 2. Current Items
    mockSql.mockResolvedValueOnce([amazonItem, bodItem]);
    // 3. Subscription (for Amazon notification)
    mockSql.mockResolvedValueOnce([
      { subscription: { endpoint: "test" }, user_id: "u1" },
    ]);
    // 4. Subscription (for BOD notification, IF triggered)
    mockSql.mockResolvedValueOnce([
      { subscription: { endpoint: "test" }, user_id: "u1" },
    ]);

    // Mock AI to say YES for BOD
    (env.AI.run as Mock).mockResolvedValue({
      response: JSON.stringify({ should_order: true, reason: "BOD Yes" }),
    });

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

    const webpush = await import("web-push");
    // Amazon notification
    expect(webpush.default.sendNotification as Mock).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("Amazon items (1)"),
      expect.anything()
    );
    // BOD notification
    expect(webpush.default.sendNotification as Mock).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("BOD Yes"),
      expect.anything()
    );
  });
});
