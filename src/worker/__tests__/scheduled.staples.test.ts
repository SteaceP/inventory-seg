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

describe("handleScheduled - Staples Supplier", () => {
  let env: Env;
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockResolvedValue([]);
    env = createMockEnv();
    ctx = createMockCtx();
  });

  it("should handle Staples (Papeterie) correctly", async () => {
    // Test the spelling fix
    const staplesItem = {
      id: "3",
      name: "Paper",
      category: "Papeterie", // Correct spelling
      stock: 2,
      low_stock_threshold: 5,
      category_threshold: null,
    };

    mockSql.mockResolvedValueOnce([]); // History
    mockSql.mockResolvedValueOnce([staplesItem]); // Items
    mockSql.mockResolvedValueOnce([
      { subscription: { endpoint: "test" }, user_id: "u1" },
    ]); // Subs

    // AI Yes
    (env.AI_SERVICE.run as Mock).mockResolvedValue({
      response: JSON.stringify({ should_order: true, reason: "Staples Yes" }),
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

    // Verify prompt contains "Staples"
    const aiRunSpy = env.AI_SERVICE.run as Mock;
    expect(aiRunSpy).toHaveBeenCalledWith(
      expect.anything(),
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
      {
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining("Supplier: Staples"),
          }),
        ]),
      } as any
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
    );
  });
});
