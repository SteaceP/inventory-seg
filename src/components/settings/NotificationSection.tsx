import React from "react";
import {
    Box,
    Paper,
    Typography,
    FormControlLabel,
    Switch,
    TextField,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

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
    return (
        <Paper
            sx={{
                p: 3,
                background: "rgba(22, 27, 34, 0.7)",
                backdropFilter: "blur(10px)",
                border: "1px solid #30363d",
                borderRadius: "12px",
                height: "100%",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <NotificationsIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                    Notifications
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={notifications}
                            onChange={async (e) => {
                                const checked = e.target.checked;
                                if (checked && "Notification" in window && Notification.permission !== "granted") {
                                    await Notification.requestPermission();
                                }
                                onNotificationsChange(checked);
                            }}
                            color="primary"
                        />
                    }
                    label="Activer les notifications"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={emailAlerts}
                            onChange={(e) => onEmailAlertsChange(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Alertes e-mail pour stock faible"
                />
                {emailAlerts && (
                    <TextField
                        label="Seuil de stock faible"
                        type="number"
                        fullWidth
                        value={lowStockThreshold}
                        onChange={(e) => onThresholdChange(parseInt(e.target.value) || 0)}
                        sx={{
                            mt: 2,
                            "& .MuiOutlinedInput-root": {
                                color: "white",
                                "& fieldset": { borderColor: "#30363d" },
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
