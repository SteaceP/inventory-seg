import React from "react";
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Button,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";

interface NotificationSectionProps {
  notifications: boolean;
  emailAlerts: boolean;
  lowStockThreshold: number;
  onNotificationsChange: (enabled: boolean) => void;
  onEmailAlertsChange: (enabled: boolean) => void;
  onThresholdChange: (threshold: number) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  notifications,
  emailAlerts,
  lowStockThreshold,
  onNotificationsChange,
  onEmailAlertsChange,
  onThresholdChange,
}) => {
  const { t } = useTranslation();

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
              checked={notifications}
              onChange={async (e) => {
                const checked = e.target.checked;
                if (
                  checked &&
                  "Notification" in window &&
                  Notification.permission !== "granted"
                ) {
                  await Notification.requestPermission();
                }
                onNotificationsChange(checked);
              }}
              color="primary"
            />
          }
          label={t("notifications.enable")}
        />

        {notifications && (
          <Button
            size="small"
            variant="outlined"
            onClick={async () => {
              if (!("Notification" in window)) return;

              const options = {
                body: "Ceci est un test de notification mobile !",
                icon: "/icon.svg",
                badge: "/icon.svg",
                vibrate: [200, 100, 200],
                requireInteraction: true,
              } as NotificationOptions & { vibrate?: number[] };

              if (
                "serviceWorker" in navigator &&
                Notification.permission === "granted"
              ) {
                const registration = await navigator.serviceWorker.ready;
                registration.showNotification("Test Inventaire SEG", options);
              } else if (Notification.permission === "granted") {
                new Notification("Test Inventaire SEG", options);
              } else {
                await Notification.requestPermission();
              }
            }}
            sx={{
              ml: 4,
              mb: 1,
              textTransform: "none",
              borderRadius: "12px",
              fontSize: "0.8rem",
            }}
          >
            {t("notifications.testMobile")}
          </Button>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={emailAlerts}
              onChange={(e) => onEmailAlertsChange(e.target.checked)}
              color="primary"
            />
          }
          label={t("notifications.emailAlerts")}
        />
        {emailAlerts && (
          <TextField
            label={t("notifications.lowStockThreshold")}
            type="number"
            fullWidth
            value={lowStockThreshold}
            onChange={(e) => onThresholdChange(parseInt(e.target.value) || 0)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "divider" },
              },
            }}
            InputLabelProps={{ sx: { color: "text.secondary" } }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default NotificationSection;
