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
  userId: string | null;
  emailAlerts: boolean;
  lowStockThreshold: number;
  pushEnabled: boolean;
  onEmailAlertsChange: (enabled: boolean) => void;
  onThresholdChange: (threshold: number) => void;
  onPushToggle: (enabled: boolean) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  userId,
  emailAlerts,
  lowStockThreshold,
  pushEnabled,
  onEmailAlertsChange,
  onThresholdChange,
  onPushToggle,
}) => {
  const { t } = useTranslation();

  const handleTestNotification = async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/send-test-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    } catch (err) {
      console.error("Test push failed:", err);
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
              checked={pushEnabled}
              onChange={(e) => onPushToggle(e.target.checked)}
              color="primary"
            />
          }
          label={t("notifications.pushEnabled")}
        />

        <Button
          size="small"
          variant="outlined"
          onClick={handleTestNotification}
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
