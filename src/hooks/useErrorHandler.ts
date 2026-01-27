import { useCallback } from "react";
import { useAlert } from "@contexts/AlertContext";
import { reportError } from "@utils/errorReporting";

/**
 * Custom hook that provides a unified way to handle errors in the frontend.
 * It reports the error to Sentry and shows a user-facing MUI alert.
 */
export const useErrorHandler = () => {
  const { showError } = useAlert();

  const handleError = useCallback(
    (
      error: unknown,
      userMessage?: string,
      context?: Record<string, unknown>
    ) => {
      // Report to Sentry
      reportError(error, context);

      // Show MUI alert if a message is provided
      if (userMessage) {
        showError(userMessage);
      }
    },
    [showError]
  );

  return { handleError };
};
