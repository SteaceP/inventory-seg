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

  // State for notification settings, assuming they are now managed internally
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Placeholder for fetching initial settings or handling changes
  useEffect(() => {
    // In a real application, you would fetch these settings from a backend
    // or user preferences and update the state here.
    // For now, we'll just set some defaults or leave them as initial useState values.
  }, [userId]);

  const handleEmailAlertsChange = (enabled: boolean) => {
    setEmailAlerts(enabled);
    // Call API to update setting
  };

  const handleThresholdChange = (threshold: number) => {
    setLowStockThreshold(threshold);
    // Call API to update setting
  };

  const handlePushToggle = (enabled: boolean) => {
    setPushEnabled(enabled);
    // Call API to update setting
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

      showSuccess(t("notifications.testMobileSuccess")); // Show success message
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
              onChange={(e) => handlePushToggle(e.target.checked)}
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
              onChange={(e) => handleEmailAlertsChange(e.target.checked)}
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
              handleThresholdChange(parseInt(e.target.value) || 0)
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
