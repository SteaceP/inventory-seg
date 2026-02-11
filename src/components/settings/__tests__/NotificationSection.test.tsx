import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  createMockAlertContext,
  createMockTranslation,
  createMockUserContext,
  mockSupabaseClient,
} from "@test/mocks";

import NotificationSection from "../NotificationSection";

// No unused imports

// Hoist mocks to avoid unbound-method lint errors
const mocks = vi.hoisted(() => ({
  subscribeToPush: vi.fn(),
  unsubscribeFromPush: vi.fn(),
  checkPushSubscription: vi.fn(),
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

// Mock supabaseClient via global setup
// The mockSupabaseClient is already configured in src/test/setup.ts
// We just need to ensure the mocks are clear or set up specific return values in tests

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

    // Setup Supabase mocks
    mockSupabaseClient.helpers.setAuthSession({ access_token: "fake-token" });

    // Mock settings fetch chain: from -> select -> eq -> single
    mockSupabaseClient.mocks.from.mockReturnValue({
      select: mockSupabaseClient.mocks.select,
      update: mockSupabaseClient.mocks.update,
    });

    mockSupabaseClient.mocks.select.mockReturnValue({
      eq: mockSupabaseClient.mocks.eq,
    });

    // Default single response (settings)
    mockSupabaseClient.mocks.single.mockResolvedValue({
      data: {
        notifications: false,
        email_alerts: false,
        low_stock_threshold: 10,
      },
      error: null,
    });

    // Mock settings update chain: from -> update -> eq
    mockSupabaseClient.mocks.update.mockReturnValue({
      eq: mockSupabaseClient.mocks.eq,
    });

    // Default eq response for update (success)
    mockSupabaseClient.mocks.eq.mockResolvedValue({ error: null });
    // Also make eq chainable for select->eq
    mockSupabaseClient.mocks.eq.mockReturnValue({
      single: mockSupabaseClient.mocks.single,
    });
  });

  it("should render notification titles and switches", () => {
    render(<NotificationSection />);

    expect(screen.getByText(/notifications.title/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications.pushEnabled/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications.emailAlerts/i)).toBeInTheDocument();
  });

  it("should toggle push notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationSection />);

    const pushSwitch = screen.getByRole("switch", {
      name: /notifications.pushEnabled/i,
    });

    // Initial state should be unchecked
    expect(pushSwitch).not.toBeChecked();

    await user.click(pushSwitch);

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
    const user = userEvent.setup();
    render(<NotificationSection />);

    expect(
      screen.queryByLabelText(/notifications.lowStockThreshold/i)
    ).not.toBeInTheDocument();

    const emailSwitch = screen.getByRole("switch", {
      name: /notifications.emailAlerts/i,
    });
    await user.click(emailSwitch);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/notifications.lowStockThreshold/i)
      ).toBeInTheDocument();
    });

    await user.click(emailSwitch);

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/notifications.lowStockThreshold/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should change threshold value", async () => {
    const user = userEvent.setup();
    render(<NotificationSection />);

    await user.click(
      screen.getByRole("switch", { name: /notifications.emailAlerts/i })
    );

    const input = await screen.findByLabelText(
      /notifications.lowStockThreshold/i
    );
    await user.clear(input);
    await user.type(input, "15");

    await waitFor(() => {
      expect(input).toHaveValue(15);
    });
  });

  it("should handle successful test notification", async () => {
    mockSupabaseClient.helpers.setAuthSession({ access_token: "fake-token" });
    mockFetch.mockResolvedValue({
      ok: true,
    } as Response);

    const user = userEvent.setup();
    render(<NotificationSection />);

    const button = screen.getByTestId("test-push-button");
    await user.click(button);

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

  it("should handle failed test notification with generic error", async () => {
    mockSupabaseClient.helpers.setAuthSession({ access_token: "fake-token" });
    const errorMsg = "API Error";
    mockFetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(errorMsg),
      json: () => Promise.reject(new Error("Invalid JSON")),
    } as unknown as Response);

    const user = userEvent.setup();
    render(<NotificationSection />);

    const button = screen.getByTestId("test-push-button");
    await user.click(button);

    await waitFor(() => {
      // Should fallback to handle error with text
      expect(mockAlert.showError).toHaveBeenCalledWith(errorMsg);
    });
  });

  it("should handle NO_SUBSCRIPTION error", async () => {
    mockSupabaseClient.helpers.setAuthSession({ access_token: "fake-token" });

    // Mock error response with specific structure
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ errorType: "NO_SUBSCRIPTION" }),
    } as Response);

    const user = userEvent.setup();
    render(<NotificationSection />);

    const button = screen.getByTestId("test-push-button");
    await user.click(button);

    await waitFor(() => {
      // Should show specific error message directly via showError
      // Note: We use t() key because we're mocking translation and checking behavior
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "settings.notifications.error.noSubscription"
      );
    });
  });

  it("should handle CONFIG_ERROR", async () => {
    mockSupabaseClient.helpers.setAuthSession({ access_token: "fake-token" });

    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ errorType: "CONFIG_ERROR" }),
    } as Response);

    const user = userEvent.setup();
    render(<NotificationSection />);

    const button = screen.getByTestId("test-push-button");
    await user.click(button);

    await waitFor(() => {
      expect(mockAlert.showError).toHaveBeenCalledWith(
        "settings.notifications.error.config"
      );
    });
  });
});
