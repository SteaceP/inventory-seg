import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useErrorHandler } from "./useErrorHandler";
import * as errorReporting from "../utils/errorReporting";
import { AlertProvider } from "../contexts/AlertContext";

// Mock the error reporting module
vi.mock("../utils/errorReporting", () => ({
  reportError: vi.fn(),
}));

// Helper to wrap hook with AlertContext
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AlertProvider>{children}</AlertProvider>
);

describe("useErrorHandler", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it("should report error to Sentry", () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    const testError = new Error("Test error");

    act(() => {
      result.current.handleError(testError);
    });

    expect(errorReporting.reportError).toHaveBeenCalledWith(
      testError,
      undefined
    );
    expect(errorReporting.reportError).toHaveBeenCalledTimes(1);
  });

  it("should report error with context", () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    const testError = new Error("Database error");
    const context = { userId: "123", action: "update" };

    act(() => {
      result.current.handleError(testError, undefined, context);
    });

    expect(errorReporting.reportError).toHaveBeenCalledWith(testError, context);
  });

  it("should handle error with user message", () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    const testError = new Error("API error");
    const userMessage = "Failed to save changes";

    act(() => {
      result.current.handleError(testError, userMessage);
    });

    expect(errorReporting.reportError).toHaveBeenCalledWith(
      testError,
      undefined
    );
    // Note: Testing that showError was called would require mocking AlertContext
    // or checking the UI, which is beyond unit testing scope
  });

  it("should handle error without user message", () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    const testError = new Error("Silent error");

    act(() => {
      result.current.handleError(testError);
    });

    expect(errorReporting.reportError).toHaveBeenCalledWith(
      testError,
      undefined
    );
    // No alert should be shown when userMessage is undefined
  });

  it("should maintain stable callback reference", () => {
    const { result, rerender } = renderHook(() => useErrorHandler(), {
      wrapper,
    });
    const firstCallback = result.current.handleError;

    rerender();
    const secondCallback = result.current.handleError;

    // useCallback should maintain the same reference
    expect(firstCallback).toBe(secondCallback);
  });

  it("should handle different error types", () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    // Test with Error object
    const error1 = new Error("Error object");
    act(() => {
      result.current.handleError(error1);
    });
    expect(errorReporting.reportError).toHaveBeenCalledWith(error1, undefined);

    // Test with string
    const error2 = "String error";
    act(() => {
      result.current.handleError(error2);
    });
    expect(errorReporting.reportError).toHaveBeenCalledWith(error2, undefined);

    // Test with custom object
    const error3 = { code: 500, message: "Server error" };
    act(() => {
      result.current.handleError(error3);
    });
    expect(errorReporting.reportError).toHaveBeenCalledWith(error3, undefined);

    expect(errorReporting.reportError).toHaveBeenCalledTimes(3);
  });
});
