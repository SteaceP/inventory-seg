import * as Sentry from "@sentry/react";

/**
 * Centrally manages error reporting to Sentry.
 * This can be used in components, hooks, or utility functions.
 */
export const reportError = (
  error: unknown,
  context?: Record<string, unknown>
) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Centrally manages non-error tracking/logging to Sentry.
 */
export const logInfo = (message: string, context?: Record<string, unknown>) => {
  // We can use Sentry.captureMessage for non-exception logs
  Sentry.captureMessage(message, {
    level: "info",
    extra: context,
  });
};
