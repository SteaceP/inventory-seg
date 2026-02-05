import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import RealtimeNotifications from "../RealtimeNotifications";

// Hoist mocks to share between factory and tests
const mocks = vi.hoisted(() => {
  const showInfo = vi.fn();
  const handleError = vi.fn();
  const userId = "test-user-123";
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  };
  const setAuth = vi.fn().mockResolvedValue(undefined);
  const removeChannel = vi.fn();

  // Return a stable mock for the channel function itself
  // We'll attach the channel object to it as a property for easy access in tests
  const channelFn = vi.fn(() => channel);

  return {
    showInfo,
    handleError,
    userId,
    channel,
    channelFn,
    setAuth,
    removeChannel,
  };
});

// Mock Dependencies
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mocks.handleError,
  }),
}));

vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => ({
    userId: mocks.userId,
  }),
}));

vi.mock("@contexts/AlertContext", () => ({
  useAlert: () => ({
    showInfo: mocks.showInfo,
  }),
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@supabaseClient", () => ({
  supabase: {
    channel: mocks.channelFn,
    removeChannel: mocks.removeChannel,
    realtime: {
      setAuth: mocks.setAuth,
    },
  },
}));

describe("RealtimeNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure the chainable mock returns 'this' (the channel object)
    mocks.channel.on.mockReturnThis();
    // Reset our channel function to return the same channel object
    mocks.channelFn.mockReturnValue(mocks.channel);
  });

  it("should render null component", () => {
    const { container } = render(<RealtimeNotifications />);
    expect(container.firstChild).toBeNull();
  });

  it("should initialize Supabase private channel correctly", () => {
    render(<RealtimeNotifications />);

    expect(mocks.channelFn).toHaveBeenCalledWith("app-activity", {
      config: { private: true },
    });
  });

  it("should set up all required broadcast event listeners", async () => {
    render(<RealtimeNotifications />);

    await vi.waitFor(() => {
      // Check strict call order/args for the 'on' chain
      expect(mocks.channel.on).toHaveBeenCalledWith(
        "broadcast",
        { event: "INSERT" },
        expect.any(Function)
      );
    });

    expect(mocks.channel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "UPDATE" },
      expect.any(Function)
    );
    expect(mocks.channel.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "DELETE" },
      expect.any(Function)
    );

    // Verify subscription happens after setup
    expect(mocks.channel.subscribe).toHaveBeenCalledTimes(1);

    // Verify order: on calls happen before subscribe
    const onCallOrder = mocks.channel.on.mock.invocationCallOrder[0];
    const subCallOrder = mocks.channel.subscribe.mock.invocationCallOrder[0];
    expect(onCallOrder).toBeLessThan(subCallOrder);
  });

  it("should establish realtime authorization", async () => {
    render(<RealtimeNotifications />);

    // Auth setting is async in the effect
    await vi.waitFor(() => {
      expect(mocks.setAuth).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle authorization errors gracefully", async () => {
    const authError = new Error("Auth failed");
    mocks.setAuth.mockRejectedValueOnce(authError);

    render(<RealtimeNotifications />);

    await vi.waitFor(() => {
      expect(mocks.handleError).toHaveBeenCalledWith(authError);
    });
  });

  it("should cleanup channel on unmount", () => {
    const { unmount } = render(<RealtimeNotifications />);

    unmount();

    expect(mocks.removeChannel).toHaveBeenCalledWith(mocks.channel);
  });

  it("should process INSERT broadcast events for inventory activity", async () => {
    render(<RealtimeNotifications />);

    // Wait for handlers to be attached
    await vi.waitFor(() => {
      expect(mocks.channel.on).toHaveBeenCalled();
    });

    // Get the INSERT handler callback
    const calls = mocks.channel.on.mock.calls as unknown as [
      string,
      { event: string },
      (payload: unknown) => void,
    ][];
    const insertCall = calls.find((c) => c[1].event === "INSERT");
    if (!insertCall) throw new Error("INSERT handler not registered");

    const insertHandler = insertCall[2] as (payload: {
      payload: {
        table: string;
        event: string;
        record: Record<string, unknown>;
      };
    }) => void;

    const payload = {
      payload: {
        table: "inventory_activity",
        event: "INSERT",
        record: {
          user_id: "other-user-id", // Not the current user
          item_name: "Test Item",
          action: "created",
        },
      },
    };

    insertHandler(payload);

    expect(mocks.showInfo).toHaveBeenCalledWith(
      expect.stringContaining("recentActivity.action.created")
    );
    expect(mocks.showInfo).toHaveBeenCalledWith(
      expect.stringContaining("Test Item")
    );
  });

  it("should ignore own INSERT events", async () => {
    render(<RealtimeNotifications />);

    // Wait for handlers
    await vi.waitFor(() => {
      expect(mocks.channel.on).toHaveBeenCalled();
    });

    const calls = mocks.channel.on.mock.calls as unknown as [
      string,
      { event: string },
      (payload: unknown) => void,
    ][];
    const insertCall = calls.find((c) => c[1].event === "INSERT");
    if (!insertCall) throw new Error("INSERT handler not registered");

    const insertHandler = insertCall[2] as (payload: {
      payload: {
        table: string;
        event: string;
        record: Record<string, unknown>;
      };
    }) => void;

    const payload = {
      payload: {
        table: "inventory_activity",
        event: "INSERT",
        record: {
          user_id: mocks.userId, // Current user
          item_name: "My Item",
          action: "created",
        },
      },
    };

    insertHandler(payload);

    expect(mocks.showInfo).not.toHaveBeenCalled();
  });
});
