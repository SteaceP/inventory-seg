import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";

import { supabase } from "@/supabaseClient";

import {
  subscribeToPush,
  unsubscribeFromPush,
  checkPushSubscription,
} from "../push-notifications";

// Mock Supabase client
vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock crypto utils
vi.mock("../crypto", () => ({
  getDeviceInfo: vi.fn(() => "Test Device"),
}));

describe("push-notifications", () => {
  const mockServiceWorkerRegistration = {
    pushManager: {
      getSubscription: vi.fn(),
      subscribe: vi.fn(),
    },
  };

  const mockSubscription = {
    endpoint: "https://fcm.googleapis.com/fcm/send/test",
    toJSON: () => ({ endpoint: "https://fcm.googleapis.com/fcm/send/test" }),
    unsubscribe: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_VAPID_PUBLIC_KEY", "test-vapid-key");

    // Mock window and navigator
    vi.stubGlobal("window", {
      atob: (str: string) => atob(str),
      PushManager: {},
    });

    vi.stubGlobal("navigator", {
      serviceWorker: {
        ready: Promise.resolve(mockServiceWorkerRegistration),
      },
    });

    // Default Supabase mock implementation
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    (supabase.from as Mock).mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnValue({
        match: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("checkPushSubscription", () => {
    it("should return false if PushManager is not supported", async () => {
      vi.stubGlobal("window", {}); // Remove PushManager
      const result = await checkPushSubscription();
      expect(result).toBe(false);
    });

    it("should return true if subscription exists", async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(
        mockSubscription
      );
      const result = await checkPushSubscription();
      expect(result).toBe(true);
    });

    it("should return false if no subscription exists", async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(
        null
      );
      const result = await checkPushSubscription();
      expect(result).toBe(false);
    });
  });

  describe("subscribeToPush", () => {
    it("should throw error if PushManager not supported", async () => {
      vi.stubGlobal("window", {}); // Remove PushManager
      await expect(subscribeToPush()).rejects.toThrow(
        "Push notifications are not supported"
      );
    });

    it("should return existing subscription if found", async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(
        mockSubscription
      );
      const sub = await subscribeToPush();
      expect(sub).toBe(mockSubscription);
      expect(
        mockServiceWorkerRegistration.pushManager.subscribe
      ).not.toHaveBeenCalled();
    });

    it("should subscribe if no existing subscription", async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(
        null
      );
      mockServiceWorkerRegistration.pushManager.subscribe.mockResolvedValue(
        mockSubscription
      );

      const sub = await subscribeToPush();

      expect(sub).toBe(mockSubscription);
      expect(
        mockServiceWorkerRegistration.pushManager.subscribe
      ).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array) as unknown as Uint8Array,
      });

      // Verification of Supabase upsert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const fromSpy = supabase.from as Mock;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const getUserSpy = supabase.auth.getUser as Mock;
      expect(fromSpy).toHaveBeenCalledWith("push_subscriptions");
      expect(getUserSpy).toHaveBeenCalled();
    });
  });

  describe("unsubscribeFromPush", () => {
    it("should unsubscribe if subscription exists", async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(
        mockSubscription
      );

      await unsubscribeFromPush();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const fromSpy = supabase.from as Mock;
      expect(fromSpy).toHaveBeenCalledWith("push_subscriptions");
    });

    it("should do nothing if no subscription exists", async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(
        null
      );

      await unsubscribeFromPush();

      expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
    });
  });
});
