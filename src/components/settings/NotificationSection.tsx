import React, { useState, useEffect } from "react";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { useUserContext } from "@contexts/UserContext";
import { useAlert } from "@contexts/AlertContext";
import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import NotificationsIcon from "@mui/icons-material/Notifications";

const NotificationSection: React.FC = () => {
  const { t } = useTranslation();
  const { userId } = useUserContext();
  const { showError, showSuccess } = useAlert();
  const { handleError } = useErrorHandler();

  // State for notification settings
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Fetch initial settings from backend
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
          setPushEnabled(data.notifications ?? false);
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

    setPushEnabled(enabled);

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ notifications: enabled })
        .eq("user_id", userId);

      if (error) throw error;

      showSuccess(t("settings.notifications.pushUpdated"));
    } catch (err) {
      setPushEnabled(!enabled); // Revert on error
      handleError(err, t("settings.notifications.updateError"));
    }
  };

  const handleTestNotification = async () => {
    if (!userId) {
      showError(t("notifications.testErrorNoUser")); // Example error for no user
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
        throw new Error(await response.text());
      }

      showSuccess(t("notifications.testMobileSuccess"));
    } catch (err) {
      handleError(err, t("settings.notifications.testError"));
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        background: (theme) =>
          theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <NotificationsIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" fontWeight="bold">
          {t("notifications.title")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              id="push-notifications"
              name="pushEnabled"
              checked={pushEnabled}
              onChange={(e) => void handlePushToggle(e.target.checked)}
              color="primary"
            />
          }
          label={t("notifications.pushEnabled")}
        />

        <Button
          size="small"
          variant="outlined"
          onClick={() => void handleTestNotification()}
          data-testid="test-push-button"
          sx={{
            ml: 4,
            mb: 1,
            textTransform: "none",
            borderRadius: "12px",
            fontSize: "0.8rem",
            alignSelf: "flex-start",
          }}
        >
          {t("notifications.testMobile")}
        </Button>

        <FormControlLabel
          control={
            <Switch
              id="email-alerts"
              name="emailAlerts"
              checked={emailAlerts}
              onChange={(e) => void handleEmailAlertsChange(e.target.checked)}
              color="primary"
            />
          }
          label={t("notifications.emailAlerts")}
        />
        {emailAlerts && (
          <TextField
            id="low-stock-threshold"
            name="lowStockThreshold"
            label={t("notifications.lowStockThreshold")}
            type="number"
            fullWidth
            value={lowStockThreshold}
            onChange={(e) =>
              void handleThresholdChange(parseInt(e.target.value) || 0)
            }
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "divider" },
              },
            }}
            slotProps={{ inputLabel: { sx: { color: "text.secondary" } } }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default NotificationSection;
