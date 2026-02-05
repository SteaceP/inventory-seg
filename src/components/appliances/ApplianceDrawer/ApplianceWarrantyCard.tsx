import React from "react";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";

interface ApplianceWarrantyCardProps {
  appliance: Appliance;
}

const ApplianceWarrantyCard: React.FC<ApplianceWarrantyCardProps> = ({
  appliance,
}) => {
  const { t } = useTranslation();

  const calculateWarrantyProgress = () => {
    if (!appliance.purchase_date || !appliance.warranty_expiry) return 100;
    const start = new Date(appliance.purchase_date).getTime();
    const end = new Date(appliance.warranty_expiry).getTime();
    const now = new Date().getTime();
    const total = end - start;
    if (total <= 0) return 0;
    const elapsed = now - start;
    const progress = (1 - elapsed / total) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const isWarrantyExpired = () => {
    if (!appliance.warranty_expiry) return false;
    return new Date(appliance.warranty_expiry) < new Date();
  };

  const expired = isWarrantyExpired();

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight="bold"
        >
          {t("appliances.warranty.title")}
        </Typography>
        <Typography
          variant="caption"
          color={expired ? "error.main" : "success.main"}
          fontWeight="bold"
        >
          {expired
            ? t("appliances.warranty.expired")
            : t("appliances.warranty.active")}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={calculateWarrantyProgress()}
        color={expired ? "error" : "success"}
        sx={{ height: 8, borderRadius: 4, mb: 1 }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          {appliance.purchase_date || "—"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {appliance.warranty_expiry || "—"}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ApplianceWarrantyCard;
