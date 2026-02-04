import React from "react";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useTranslation } from "@/i18n";

interface PushNotificationSettingsProps {
  pushEnabled: boolean;
  onToggle: (checked: boolean) => void;
  onTest: () => void;
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({
  pushEnabled,
  onToggle,
  onTest,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            id="push-notifications"
            name="pushEnabled"
            checked={pushEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            color="primary"
          />
        }
        label={t("notifications.pushEnabled")}
      />

      <Button
        size="small"
        variant="outlined"
        onClick={() => void onTest()}
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
    </>
  );
};

export default PushNotificationSettings;
