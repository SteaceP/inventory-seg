import { useState, useEffect } from "react";

import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";
import type { ApiResponseError } from "@/types/worker";
import {
  subscribeToPush,
  unsubscribeFromPush,
  checkPushSubscription,
} from "@/utils/push-notifications";

import { useAlert } from "@contexts/AlertContext";
import { useUserContext } from "@contexts/UserContextDefinition";
import { useErrorHandler } from "@hooks/useErrorHandler";

export const useNotificationSettings = () => {
  const { t } = useTranslation();
  const { userId } = useUserContext();
  const { showError, showSuccess } = useAlert();
  const { handleError } = useErrorHandler();

  // State for notification settings
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Fetch initial settings from backend and check push subscription
  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("notifications, email_alerts, low_stock_threshold")
          .eq("user_id", userId)
          .single();

        if (error) throw error;

        if (data) {
          // Check actual browser subscription state
          const hasPushSubscription = await checkPushSubscription();

          // Sync database with browser state if they differ
          if (data.notifications && !hasPushSubscription) {
            // Database says enabled but browser has no subscription
            // Update database to match reality
            await supabase
              .from("user_settings")
              .update({ notifications: false })
              .eq("user_id", userId);
            setPushEnabled(false);
          } else {
            setPushEnabled(data.notifications ?? false);
          }

          setEmailAlerts(data.email_alerts ?? false);
          setLowStockThreshold(data.low_stock_threshold ?? 0);
        }
      } catch (err) {
        handleError(err, t("settings.notifications.fetchError"));
      }
    };

    void fetchSettings();
  }, [userId, handleError, t]);

  const handleEmailAlertsChange = async (enabled: boolean) => {
    if (!userId) return;

    setEmailAlerts(enabled);

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ email_alerts: enabled })
        .eq("user_id", userId);

      if (error) throw error;

      showSuccess(t("settings.notifications.emailAlertsUpdated"));
    } catch (err) {
      setEmailAlerts(!enabled); // Revert on error
      handleError(err, t("settings.notifications.updateError"));
    }
  };

  const handleThresholdChange = async (threshold: number) => {
    if (!userId) return;

    setLowStockThreshold(threshold);

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ low_stock_threshold: threshold })
        .eq("user_id", userId);

      if (error) throw error;

      showSuccess(t("settings.notifications.thresholdUpdated"));
    } catch (err) {
      handleError(err, t("settings.notifications.updateError"));
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (!userId) return;

    try {
      if (enabled) {
        // Subscribe to push notifications
        try {
          await subscribeToPush();

          // Update database after successful subscription
          const { error } = await supabase
            .from("user_settings")
            .update({ notifications: true })
            .eq("user_id", userId);

          if (error) throw error;

          setPushEnabled(true);
          showSuccess(t("settings.notifications.pushUpdated"));
        } catch (subError) {
          // Handle permission denial or subscription failure
          const errorMessage = (subError as Error).message;
          if (errorMessage.includes("not supported")) {
            showError(t("notifications.notSupported"));
          } else if (errorMessage.includes("VAPID")) {
            showError(t("notifications.configError"));
          } else {
            showError(t("notifications.permissionDenied"));
          }
          setPushEnabled(false);
          throw subError;
        }
      } else {
        // Unsubscribe from push notifications
        await unsubscribeFromPush();

        // Update database after successful unsubscription
        const { error } = await supabase
          .from("user_settings")
          .update({ notifications: false })
          .eq("user_id", userId);

        if (error) throw error;

        setPushEnabled(false);
        showSuccess(t("settings.notifications.pushUpdated"));
      }
    } catch (err) {
      // General error handling (already handled specific errors above for subscribe)
      if (enabled) {
        setPushEnabled(false);
      } else {
        // For unsubscribe errors, log them
        handleError(err, t("settings.notifications.updateError"));
      }
    }
  };

  const handleTestNotification = async () => {
    if (!userId) {
      showError(t("notifications.testErrorNoUser"));
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session found.");
      }

      const response = await fetch("/api/send-test-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        // Try to parse the error response JSON
        try {
          const errorData = (await response.json()) as ApiResponseError;
          const errorType = errorData.errorType;

          if (errorType === "NO_SUBSCRIPTION") {
            throw new Error(t("settings.notifications.error.noSubscription"));
          } else if (errorType === "CONFIG_ERROR") {
            throw new Error(t("settings.notifications.error.config"));
          } else if (errorType === "DB_ERROR") {
            throw new Error(t("settings.notifications.error.db"));
          } else if (errorData.error) {
            throw new Error(errorData.error);
          }
        } catch (parseError) {
          // If we already threw a specific error above, rethrow it
          if (
            parseError instanceof Error &&
            parseError.message !== "Unexpected token" &&
            parseError.message !== "JSON.parse: unexpected character"
          ) {
            // Check if it's one of our known error messages (simple heuristic)
            if (
              parseError.message ===
                t("settings.notifications.error.noSubscription") ||
              parseError.message === t("settings.notifications.error.config") ||
              parseError.message === t("settings.notifications.error.db")
            ) {
              throw parseError;
            }
            // For other errors (like JSON parse error), fall through to text fallback
          }

          // If JSON parsing fails or no specific error structure, fallback to text or default
          throw new Error(await response.text());
        }

        throw new Error(response.statusText);
      }

      showSuccess(t("notifications.testMobileSuccess"));
    } catch (err) {
      // Use the specific error message if it was thrown above, otherwise default generic error
      const message =
        err instanceof Error
          ? err.message
          : t("settings.notifications.testError");
      // If the error message is the translation key (meaning it wasn't translated yet), use fallback
      if (message === "settings.notifications.testError") {
        handleError(err, t("settings.notifications.testError"));
      } else {
        // Use our specific error message
        showError(message);
      }
    }
  };

  return {
    emailAlerts,
    lowStockThreshold,
    pushEnabled,
    handleEmailAlertsChange,
    handleThresholdChange,
    handlePushToggle,
    handleTestNotification,
  };
};
