import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// Mock supabaseClient
vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
    },
  },
}));

describe("NotificationSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render notification titles and switches", () => {
    render(<NotificationSection />);

    expect(screen.getByText(/notifications.title/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications.pushEnabled/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications.emailAlerts/i)).toBeInTheDocument();
  });

  it("should toggle push notifications", () => {
    render(<NotificationSection />);

    const pushSwitch = screen.getByRole("switch", {
      name: /notifications.pushEnabled/i,
    });
    expect(pushSwitch).not.toBeChecked();

    fireEvent.click(pushSwitch);
    expect(pushSwitch).toBeChecked();
  });

  it("should show/hide threshold field when email alerts are toggled", () => {
    render(<NotificationSection />);

    expect(
      screen.queryByLabelText(/notifications.lowStockThreshold/i)
    ).not.toBeInTheDocument();

    const emailSwitch = screen.getByRole("switch", {
      name: /notifications.emailAlerts/i,
    });
    fireEvent.click(emailSwitch);

    expect(
      screen.getByLabelText(/notifications.lowStockThreshold/i)
    ).toBeInTheDocument();

    fireEvent.click(emailSwitch);
    expect(
      screen.queryByLabelText(/notifications.lowStockThreshold/i)
    ).not.toBeInTheDocument();
  });

  it("should change threshold value", () => {
    render(<NotificationSection />);

    fireEvent.click(
      screen.getByRole("switch", { name: /notifications.emailAlerts/i })
    );

    const input = screen.getByLabelText(/notifications.lowStockThreshold/i);
    fireEvent.change(input, { target: { value: "15" } });

    expect(input).toHaveValue(15);
  });

  it("should handle successful test notification", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "fake-token" } as unknown as Session },
      error: null,
    });
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
    } as Response);

    render(<NotificationSection />);

    const button = screen.getByTestId("test-push-button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
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
    vi.mocked(global.fetch).mockResolvedValue({
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
