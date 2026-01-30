import { useCallback } from "react";
import * as Sentry from "@sentry/react";
import { useAlert } from "@contexts/AlertContext";
import { reportError } from "@utils/errorReporting";
import { useTranslation } from "@/i18n";

type TFunction = (
  key: string,
  params?: Record<string, string | number | boolean | null | undefined>
) => string;

interface ExtendedError extends Error {
  code?: string;
  status?: number;
}

/**
 * Detects the best localized error message based on error properties.
 */
const getErrorMessage = (
  error: unknown,
  userMessage: string | undefined,
  t: TFunction
): string | undefined => {
  if (userMessage) return userMessage;

  const err = error as ExtendedError;
  const message = err.message || "";
  const code = err.code || "";

  // 1. CAPTCHA failures
  if (message.toLowerCase().includes("captcha verification process failed")) {
    return t("errors.captcha_verification_failed");
  }

  // 2. Network/Fetch issues
  if (
    message.toLowerCase().includes("failed to fetch") ||
    message.toLowerCase().includes("network error") ||
    message.toLowerCase().includes("load failed")
  ) {
    return t("errors.network");
  }

  // 3. Supabase/Postgres Error Codes
  switch (code) {
    case "23505": // Unique constraint violation
      return t("errors.duplicateSku");
    case "42501": // RLS/Permissions
      return t("errors.unauthorized");
    case "PGRST116": // Not found (handled in some flows, but can be an error)
      return undefined; // Usually handled locally
    case "PGRST301": // JWT expired
      return t("errors.login");
  }

  // 4. Fallback to generic if no message was passed at all
  return t("errors.unexpected");
};

/**
 * Custom hook that provides a unified way to handle errors in the frontend.
 * It reports the error to Sentry with breadcrumbs and shows a user-facing MUI alert.
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
      // Add a breadcrumb to help debug where the error occurred
      Sentry.addBreadcrumb({
        category: "error.handler",
        message: userMessage || "Handled error triggered",
        level: "error",
        data: context,
      });

      // Report to Sentry
      reportError(error, context);

      const finalMessage = getErrorMessage(error, userMessage, t);

      // Show MUI alert if a message is available
      if (finalMessage) {
        showError(finalMessage);
      }
    },
    [showError, t]
  );

  return { handleError };
};
