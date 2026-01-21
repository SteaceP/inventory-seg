import * as Sentry from "@sentry/cloudflare";

/**
 * Centrally manages error reporting to Sentry for the Worker environment.
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
 * Centrally manages non-error tracking/logging to Sentry for the Worker environment.
 */
export const logInfo = (message: string, context?: Record<string, unknown>) => {
  Sentry.captureMessage(message, {
    level: "info",
    extra: context,
  });
};
