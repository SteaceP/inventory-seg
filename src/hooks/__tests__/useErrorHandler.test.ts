import * as Sentry from "@sentry/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useAlert } from "@contexts/AlertContext";
import { createMockAlertContext } from "@test/mocks";
import { reportError } from "@utils/errorReporting";

import { useErrorHandler } from "../useErrorHandler";

// Mock dependencies
vi.mock("../../contexts/AlertContext", () => ({
  useAlert: vi.fn(),
}));

vi.mock("../../utils/errorReporting", () => ({
  reportError: vi.fn(),
}));

vi.mock("@/i18n", () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key: string) => key),
    lang: "en",
  })),
}));

vi.mock("@sentry/react", () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

describe("useErrorHandler", () => {
  const mockAlert = createMockAlertContext();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlert).mockReturnValue(mockAlert);
  });

  it("reports error to Sentry", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Test error");

    result.current.handleError(error);

    expect(reportError).toHaveBeenCalledWith(error, undefined);
  });

  it("reports error with context", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Test error");
    const context = { userId: "123" };

    result.current.handleError(error, undefined, context);

    expect(reportError).toHaveBeenCalledWith(error, context);
  });

  it("shows user alert when message is provided", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Test error");
    const message = "Something went wrong";

    result.current.handleError(error, message);

    expect(mockAlert.showError).toHaveBeenCalledWith(message);
  });

  it("shows fallback error alert when message is undefined", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Test error");

    result.current.handleError(error);

    expect(mockAlert.showError).toHaveBeenCalledWith("errors.unexpected");
  });

  it("automatically detects and localizes captcha verification failure", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("captcha verification process failed");

    result.current.handleError(error);

    expect(mockAlert.showError).toHaveBeenCalledWith(
      "errors.captcha_verification_failed"
    );
  });

  it("adds Sentry breadcrumbs before reporting", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Test error");
    const userMessage = "Custom UI message";

    result.current.handleError(error, userMessage);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "error.handler",
        message: userMessage,
      })
    );
  });

  it("detects network errors", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Failed to fetch");

    result.current.handleError(error);

    expect(mockAlert.showError).toHaveBeenCalledWith("errors.network");
  });

  it("detects Supabase unique constraint errors", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = { code: "23505", message: "duplicate key" };

    result.current.handleError(error);

    expect(mockAlert.showError).toHaveBeenCalledWith("errors.duplicateSku");
  });

  it("detects Supabase RLS errors", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = { code: "42501", message: "permission denied" };

    result.current.handleError(error);

    expect(mockAlert.showError).toHaveBeenCalledWith("errors.unauthorized");
  });

  it("falls back to generic error message", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Some random error");

    result.current.handleError(error);

    expect(mockAlert.showError).toHaveBeenCalledWith("errors.unexpected");
  });
});
