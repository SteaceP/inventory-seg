/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { handleScheduled } from "../scheduled";
import type { Env } from "../types";

// Mock dependencies
const mockSql = vi.fn();
// The mock needs to be a function that returns a promise
// It also needs to handle the template literal syntax: sql`...`
// In postgres.js, the main export returns a function (the sql client)
// This client function is callable as a tag function sql`select...`
// It also has other properties, but our code mainly uses sql<T>[]`...`
// The types in the code use await sql<...>`...`
const mockPostgresClient = vi.fn((...args: unknown[]) => {
  // If it's called as a template tag (array of strings as first arg)
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

vi.mock("web-push", () => {
  return {
    default: {
      sendNotification: vi.fn().mockResolvedValue({}),
    },
  };
});

vi.mock("../errorReporting", () => ({
  reportError: vi.fn((err) => console.error(err)),
}));

describe("handleScheduled", () => {
  let env: Env;
  let ctx: ExecutionContext & { waitUntil: Mock };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mockSql implementation to default empty array
    mockSql.mockResolvedValue([]);

    env = {
      SUPABASE_URL: "mock-url",
      SUPABASE_KEY: "mock-key", // Added missing key if needed by type, though not used in scheduled.ts
      SUPABASE_SERVICE_ROLE_KEY: "mock-service-key",
      VAPID_PUBLIC_KEY: "mock-vapid-public",
      VAPID_PRIVATE_KEY: "mock-vapid-private",
      BREVO_API_KEY: "mock-brevo",
      BREVO_SENDER_EMAIL: "mock@test.com",
      SENTRY_DSN: "mock-dsn",
      HYPERDRIVE: { connectionString: "postgres://mock" },
      DB: {} as D1Database,
      AI: {
        run: vi.fn(),
      } as unknown as Ai,
    } as unknown as Env;

    ctx = {
      waitUntil: vi.fn((promise: Promise<unknown>) => {
        return promise;
      }),
      passThroughOnException: vi.fn(),
    } as unknown as ExecutionContext & { waitUntil: Mock };
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
    const aiRunSpy = env.AI.run as Mock;
    expect(aiRunSpy).not.toHaveBeenCalled();
    // Should NOT send notifications
    // Since we mocked the module 'web-push', we can import it here to check.
    const webpush = await import("web-push");
    expect(webpush.default.sendNotification as Mock).not.toHaveBeenCalled();
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

    const aiRunSpy = env.AI.run as Mock;
    expect(aiRunSpy).not.toHaveBeenCalled(); // Amazon skips AI

    const webpush = await import("web-push");
    expect(webpush.default.sendNotification as Mock).toHaveBeenCalledTimes(1);
    expect(webpush.default.sendNotification as Mock).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: "test" }),
      expect.stringContaining("Amazon items (1) can be ordered anytime"),
      expect.anything()
    );
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
    (env.AI.run as Mock).mockResolvedValue(aiResponse);

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

    const aiRunSpy = env.AI.run as Mock;
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
    (env.AI.run as Mock).mockResolvedValue(aiResponse);

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

    const aiRunSpy = env.AI.run as Mock;
    expect(aiRunSpy).toHaveBeenCalled();

    const webpush = await import("web-push");
    expect(webpush.default.sendNotification as Mock).not.toHaveBeenCalled();
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
    (env.AI.run as Mock).mockResolvedValue({
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
    const aiRunSpy = env.AI.run as Mock;
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
