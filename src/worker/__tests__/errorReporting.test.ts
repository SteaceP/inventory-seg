import { describe, it, expect, vi, beforeEach } from "vitest";

import { reportError, logInfo } from "../errorReporting";

const mockCaptureException = vi.fn();
const mockCaptureMessage = vi.fn();

vi.mock("@sentry/cloudflare", () => ({
  captureException: (...args: unknown[]) => {
    mockCaptureException(...args);
    return undefined;
  },
  captureMessage: (...args: unknown[]) => {
    mockCaptureMessage(...args);
    return undefined;
  },
}));

describe("errorReporting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reportError", () => {
    it("should call Sentry.captureException with error and context", () => {
      const error = new Error("Test Error");
      const context = { foo: "bar" };

      reportError(error, context);

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        extra: context,
      });
    });

    it("should call Sentry.captureException without context if not provided", () => {
      const error = new Error("Test Error");

      reportError(error);

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      });
    });
  });

  describe("logInfo", () => {
    it("should call Sentry.captureMessage with info level", () => {
      const message = "Info Message";
      const context = { userId: "123" };

      logInfo(message, context);

      expect(mockCaptureMessage).toHaveBeenCalledWith(message, {
        level: "info",
        extra: context,
      });
    });
  });
});
