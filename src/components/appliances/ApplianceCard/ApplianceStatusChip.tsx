import React from "react";
import { Chip, alpha, useTheme } from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as HealthyIcon,
  Error as BrokenIcon,
} from "@mui/icons-material";
import { useTranslation } from "@/i18n";

interface ApplianceStatusChipProps {
  status: "functional" | "needs_service" | "broken";
}

const ApplianceStatusChip: React.FC<ApplianceStatusChipProps> = ({
  status,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case "needs_service":
        return {
          label: t("appliances.status.needsService") || "Needs Service",
          color: theme.palette.warning.main,
          icon: <WarningIcon sx={{ fontSize: 16 }} />,
        };
      case "broken":
        return {
          label: t("appliances.status.broken") || "Broken",
          color: theme.palette.error.main,
          icon: <BrokenIcon sx={{ fontSize: 16 }} />,
        };
      default:
        return {
          label: t("appliances.status.functional") || "Functional",
          color: theme.palette.primary.main,
          icon: <HealthyIcon sx={{ fontSize: 16 }} />,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      size="small"
      icon={config.icon}
      sx={{
        bgcolor: alpha(config.color, 0.1),
        color: config.color,
        borderColor: alpha(config.color, 0.2),
        border: "1px solid",
        fontWeight: "bold",
        backdropFilter: "blur(4px)",
      }}
    />
  );
};

export default ApplianceStatusChip;
