import { useCallback } from "react";
import { useAlert } from "@contexts/AlertContext";
import { reportError } from "@utils/errorReporting";
import { useTranslation } from "@/i18n";

/**
 * Custom hook that provides a unified way to handle errors in the frontend.
 * It reports the error to Sentry and shows a user-facing MUI alert.
 */
export const useErrorHandler = () => {
  const { showError } = useAlert();
  const { t } = useTranslation();

  const handleError = useCallback(
    (
      error: unknown,
      userMessage?: string,
      context?: Record<string, unknown>
    ) => {
      // Report to Sentry
      reportError(error, context);

      let finalMessage = userMessage;

      // Centralized detection of specific error patterns
      const errorMessage = (error as { message?: string })?.message || "";

      if (errorMessage.includes("captcha verification process failed")) {
        finalMessage = t("errors.captcha_verification_failed");
      }

      // Show MUI alert if a message is available
      if (finalMessage) {
        showError(finalMessage);
      }
    },
    [showError, t]
  );

  return { handleError };
};
