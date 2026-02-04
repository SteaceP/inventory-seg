import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleTestPush } from "../notifications";
import * as push from "../../notifications/push";
import * as auth from "../../auth";
import type { Env } from "../../../types/worker";

// Mock dependencies
vi.mock("../../auth", () => ({
  verifyAuth: vi.fn(),
}));

vi.mock("../../notifications/push", () => ({
  broadcastPush: vi.fn(),
}));

vi.mock("../../errorReporting", () => ({
  reportError: vi.fn(),
}));

describe("handleTestPush", () => {
  const mockEnv = {
    VAPID_PUBLIC_KEY: "test-public-key",
    VAPID_PRIVATE_KEY: "test-private-key",
    HYPERDRIVE: { connectionString: "postgres://..." },
  } as unknown as Env;

  const mockRequest = {
    json: vi.fn(),
    headers: {
      get: vi.fn().mockReturnValue("http://localhost:3000"),
    },
  } as unknown as Request;

  /* eslint-disable @typescript-eslint/unbound-method */
  const mockVerifyAuth = vi.mocked(auth.verifyAuth);
  const mockBroadcastPush = vi.mocked(push.broadcastPush);
  const mockJson = vi.mocked(mockRequest.json);
  /* eslint-enable @typescript-eslint/unbound-method */

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue(true);
    mockJson.mockResolvedValue({ userId: "user-123" });
  });

  it("should return success when broadcastPush succeeds", async () => {
    mockBroadcastPush.mockResolvedValue(undefined);

    const response = await handleTestPush(mockRequest, mockEnv);
    const data: { success: boolean } = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockBroadcastPush).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-123", tag: "test-notification" }),
      mockEnv
    );
  });

  it("should return 400 NO_SUBSCRIPTION when no subscriptions found", async () => {
    mockBroadcastPush.mockRejectedValue(
      new Error("No push subscriptions found for this user")
    );

    const response = await handleTestPush(mockRequest, mockEnv);
    const data: { error: string; errorType: string } = await response.json();

    expect(response.status).toBe(400);
    expect(data.errorType).toBe("NO_SUBSCRIPTION");
    expect(data.error).toContain("No push subscriptions found");
  });

  it("should return 500 CONFIG_ERROR when VAPID keys missing", async () => {
    mockBroadcastPush.mockRejectedValue(
      new Error("VAPID keys are not configured")
    );

    const response = await handleTestPush(mockRequest, mockEnv);
    const data: { errorType: string } = await response.json();

    expect(response.status).toBe(500);
    expect(data.errorType).toBe("CONFIG_ERROR");
  });

  it("should return 500 DB_ERROR when database connection fails", async () => {
    mockBroadcastPush.mockRejectedValue(
      new Error("Database connection (HYPERDRIVE) is not configured")
    );

    const response = await handleTestPush(mockRequest, mockEnv);
    const data: { errorType: string } = await response.json();

    expect(response.status).toBe(500);
    expect(data.errorType).toBe("DB_ERROR");
  });
});
