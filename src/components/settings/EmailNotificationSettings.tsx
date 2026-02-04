import React from "react";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useTranslation } from "@/i18n";

interface EmailNotificationSettingsProps {
  emailAlerts: boolean;
  lowStockThreshold: number;
  onToggle: (checked: boolean) => void;
  onThresholdChange: (value: number) => void;
}

const EmailNotificationSettings: React.FC<EmailNotificationSettingsProps> = ({
  emailAlerts,
  lowStockThreshold,
  onToggle,
  onThresholdChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            id="email-alerts"
            name="emailAlerts"
            checked={emailAlerts}
            onChange={(e) => onToggle(e.target.checked)}
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
          onChange={(e) => onThresholdChange(parseInt(e.target.value) || 0)}
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "divider" },
            },
          }}
          slotProps={{ inputLabel: { sx: { color: "text.secondary" } } }}
        />
      )}
    </>
  );
};

export default EmailNotificationSettings;
