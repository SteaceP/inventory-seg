import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useErrorHandler } from "../useErrorHandler";
import { useAlert } from "../../contexts/AlertContext";
import { reportError } from "../../utils/errorReporting";
import { createMockAlertContext } from "../../test/mocks";

// Mock dependencies
vi.mock("../../contexts/AlertContext", () => ({
  useAlert: vi.fn(),
}));

vi.mock("../../utils/errorReporting", () => ({
  reportError: vi.fn(),
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

  it("does not show user alert when message is undefined", () => {
    const { result } = renderHook(() => useErrorHandler());
    const error = new Error("Test error");

    result.current.handleError(error);

    expect(mockAlert.showError).not.toHaveBeenCalled();
  });
});
