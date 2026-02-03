import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotificationSection from "../NotificationSection";
import type { Session } from "@supabase/supabase-js";
import {
  createMockAlertContext,
  createMockTranslation,
  createMockUserContext,
} from "@test/mocks";

// Hoist mocks to avoid unbound-method lint errors
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  subscribeToPush: vi.fn(),
  unsubscribeFromPush: vi.fn(),
  checkPushSubscription: vi.fn(),
  supabaseFrom: vi.fn(() => {
    const chain: {
      select: ReturnType<typeof vi.fn>;
      eq: ReturnType<typeof vi.fn>;
      single: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    } = {} as never;

    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockResolvedValue({ error: null });
    chain.single = vi.fn().mockResolvedValue({
      data: {
        notifications: false,
        email_alerts: false,
        low_stock_threshold: 10,
      },
      error: null,
    });
    chain.update = vi.fn().mockReturnValue(chain);

    return chain;
  }),
}));

// Mock contexts using centralized utilities
const mockAlert = createMockAlertContext();
const mockHandleError = vi.fn();
const mockUser = createMockUserContext({ userId: "user-123" });
const { t } = createMockTranslation();

vi.mock("@contexts/AlertContext", () => ({
  useAlert: () => mockAlert,
}));

// Mock useErrorHandler
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

// Mock UserContext
vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => mockUser,
}));

// Mock i18n
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

// Mock push-notifications utilities
vi.mock("@/utils/push-notifications", () => ({
  subscribeToPush: mocks.subscribeToPush,
  unsubscribeFromPush: mocks.unsubscribeFromPush,
  checkPushSubscription: mocks.checkPushSubscription,
}));

// Mock supabaseClient
vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
    },
    from: mocks.supabaseFrom,
  },
}));

describe("NotificationSection", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    // Default push notification mock implementations
    mocks.subscribeToPush.mockResolvedValue(undefined);
    mocks.unsubscribeFromPush.mockResolvedValue(undefined);
    mocks.checkPushSubscription.mockResolvedValue(false);
  });

  it("should render notification titles and switches", () => {
    render(<NotificationSection />);

    expect(screen.getByText(/notifications.title/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications.pushEnabled/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications.emailAlerts/i)).toBeInTheDocument();
  });

  it("should toggle push notifications", async () => {
    render(<NotificationSection />);

    const pushSwitch = screen.getByRole("switch", {
      name: /notifications.pushEnabled/i,
    });

    // Initial state should be unchecked
    await waitFor(() => {
      expect(pushSwitch).not.toBeChecked();
    });

    fireEvent.click(pushSwitch);

    // Wait for push mock to be called
    await waitFor(
      () => {
        expect(mocks.subscribeToPush).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // Wait for state update
    await waitFor(
      () => {
        expect(pushSwitch).toBeChecked();
      },
      { timeout: 2000 }
    );
  });

  it("should show/hide threshold field when email alerts are toggled", async () => {
    render(<NotificationSection />);

    expect(
      screen.queryByLabelText(/notifications.lowStockThreshold/i)
    ).not.toBeInTheDocument();

    const emailSwitch = screen.getByRole("switch", {
      name: /notifications.emailAlerts/i,
    });
    fireEvent.click(emailSwitch);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/notifications.lowStockThreshold/i)
      ).toBeInTheDocument();
    });

    fireEvent.click(emailSwitch);

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/notifications.lowStockThreshold/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should change threshold value", async () => {
    render(<NotificationSection />);

    fireEvent.click(
      screen.getByRole("switch", { name: /notifications.emailAlerts/i })
    );

    const input = await screen.findByLabelText(
      /notifications.lowStockThreshold/i
    );
    fireEvent.change(input, { target: { value: "15" } });

    await waitFor(() => {
      expect(input).toHaveValue(15);
    });
  });

  it("should handle successful test notification", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "fake-token" } as unknown as Session },
      error: null,
    });
    mockFetch.mockResolvedValue({
      ok: true,
    } as Response);

    render(<NotificationSection />);

    const button = screen.getByTestId("test-push-button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/send-test-push",
        expect.any(Object)
      );

      expect(mockAlert.showSuccess).toHaveBeenCalledWith(
        "notifications.testMobileSuccess"
      );
    });
  });

  it("should handle failed test notification", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "fake-token" } as unknown as Session },
      error: null,
    });
    const errorMsg = "API Error";
    mockFetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(errorMsg),
    } as Response);

    render(<NotificationSection />);

    const button = screen.getByTestId("test-push-button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        "settings.notifications.testError"
      );
    });
  });
});
