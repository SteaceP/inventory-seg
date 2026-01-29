import { useCallback } from "react";
import * as Sentry from "@sentry/react";

/**
 * Custom hook for performance monitoring and tracing.
 * Abstracts direct Sentry usage for span creation.
 */
export const usePerformance = () => {
  /**
   * Wraps an async operation in a Sentry span for performance tracking.
   *
   * @param op - The operation type (e.g., 'http.client', 'ui.action')
   * @param name - A descriptive name for the operation
   * @param callback - The async function to execute and measure
   */
  const measureOperation = useCallback(
    async <T>(
      op: string,
      name: string,
      callback: (span?: Sentry.Span) => Promise<T>
    ): Promise<T> => {
      return Sentry.startSpan(
        {
          op,
          name,
        },
        callback
      );
    },
    []
  );

  return { measureOperation };
};
