import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import NotificationsIcon from "@mui/icons-material/Notifications";

import { useTranslation } from "@/i18n";

import EmailNotificationSettings from "./EmailNotificationSettings";
import PushNotificationSettings from "./PushNotificationSettings";
import { useNotificationSettings } from "./useNotificationSettings";

const NotificationSection: React.FC = () => {
  const { t } = useTranslation();
  const {
    emailAlerts,
    lowStockThreshold,
    pushEnabled,
    handleEmailAlertsChange,
    handleThresholdChange,
    handlePushToggle,
    handleTestNotification,
  } = useNotificationSettings();

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
        <PushNotificationSettings
          pushEnabled={pushEnabled}
          onToggle={(checked) => void handlePushToggle(checked)}
          onTest={() => void handleTestNotification()}
        />

        <EmailNotificationSettings
          emailAlerts={emailAlerts}
          lowStockThreshold={lowStockThreshold}
          onToggle={(checked) => void handleEmailAlertsChange(checked)}
          onThresholdChange={(val) => void handleThresholdChange(val)}
        />
      </Box>
    </Paper>
  );
};

export default NotificationSection;
