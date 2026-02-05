import * as Sentry from "@sentry/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { reportError, logInfo } from "../errorReporting";

// Mock Sentry module
vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("errorReporting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reportError", () => {
    it("should capture exception with Sentry", () => {
      const error = new Error("Test error");

      reportError(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      });
      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    });

    it("should capture exception with context", () => {
      const error = new Error("Database error");
      const context = { userId: "123", action: "update" };

      reportError(error, context);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context,
      });
    });

    it("should handle string errors", () => {
      const error = "String error message";

      reportError(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      });
    });

    it("should handle object errors", () => {
      const error = { code: 500, message: "Server error" };

      reportError(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      });
    });

    it("should handle errors with complex context", () => {
      const error = new Error("API error");
      const context = {
        endpoint: "/api/inventory",
        method: "POST",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };

      reportError(error, context);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context,
      });
    });
  });

  describe("logInfo", () => {
    it("should capture message with Sentry", () => {
      const message = "User logged in";

      logInfo(message);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, {
        level: "info",
        extra: undefined,
      });
      expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    });

    it("should capture message with context", () => {
      const message = "Item created";
      const context = { itemId: "abc123", category: "Electronics" };

      logInfo(message, context);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, {
        level: "info",
        extra: context,
      });
    });

    it("should handle empty message", () => {
      logInfo("");

      expect(Sentry.captureMessage).toHaveBeenCalledWith("", {
        level: "info",
        extra: undefined,
      });
    });

    it("should handle context without message being affected", () => {
      const message = "Action completed";
      const context = {
        action: "delete",
        count: 5,
        success: true,
      };

      logInfo(message, context);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, {
        level: "info",
        extra: context,
      });
    });
  });
});
