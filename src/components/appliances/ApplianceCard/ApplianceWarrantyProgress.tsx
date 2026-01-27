import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";

interface ApplianceWarrantyProgressProps {
  appliance: Appliance;
}

const ApplianceWarrantyProgress: React.FC<ApplianceWarrantyProgressProps> = ({
  appliance,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const calculateWarranty = () => {
    if (!appliance.purchase_date || !appliance.warranty_expiry) return null;
    const start = new Date(appliance.purchase_date).getTime();
    const end = new Date(appliance.warranty_expiry).getTime();
    const now = new Date().getTime();

    if (now >= end)
      return {
        progress: 0,
        label: t("appliances.warranty.expired") || "Expired",
      };

    const total = end - start;
    const remaining = end - now;
    const progress = Math.max(0, Math.min(100, (remaining / total) * 100));

    const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    const label =
      daysLeft < 30
        ? t("appliances.warranty.expiringSoon", { days: daysLeft }) ||
          `Expiring in ${daysLeft}d`
        : t("appliances.warranty.active") || "Active";

    return { progress, label, daysLeft };
  };

  const warranty = calculateWarranty();

  if (!warranty) return null;

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary">
          {t("appliances.warranty.title") || "Warranty"}
        </Typography>
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{
            color: warranty.progress < 20 ? "error.main" : "text.primary",
            bgcolor:
              warranty.progress < 20
                ? alpha(theme.palette.error.main, 0.1)
                : "transparent",
            px: warranty.progress < 20 ? 0.5 : 0,
            borderRadius: 0.5,
          }}
        >
          {warranty.label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={warranty.progress}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.divider, 0.1),
          "& .MuiLinearProgress-bar": {
            bgcolor: warranty.progress < 20 ? "error.main" : "primary.main",
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
};

export default ApplianceWarrantyProgress;
