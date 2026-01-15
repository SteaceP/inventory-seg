import React from "react";
import { Grid, Paper, Typography, Box, alpha, useTheme } from "@mui/material";
import {
  Kitchen as ApplianceIcon,
  WarningAmber as WarningIcon,
  Build as ServiceIcon,
  Verified as HealthyIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { Appliance } from "../../types/appliances";

interface AppliancesStatsProps {
  appliances: Appliance[];
  compactView: boolean;
}

const AppliancesStats: React.FC<AppliancesStatsProps> = ({
  appliances,
  compactView,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const total = appliances.length;
  const metrics = {
    total,
    healthy: appliances.filter((a) => a.status === "functional").length,
    needsService: appliances.filter((a) => a.status === "needs_service").length,
    broken: appliances.filter((a) => a.status === "broken").length,
    warrantyAlert: appliances.filter((a) => {
      if (!a.warranty_expiry) return false;
      const expiry = new Date(a.warranty_expiry);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiry > new Date() && expiry <= thirtyDaysFromNow;
    }).length,
  };

  const statCards = [
    {
      label: t("appliances.stats.total") || "Total Units",
      value: metrics.total,
      icon: <ApplianceIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: t("appliances.stats.attention") || "Attention Required",
      value: metrics.needsService + metrics.broken,
      icon: <WarningIcon />,
      color: theme.palette.error.main,
    },
    {
      label: t("appliances.stats.healthy") || "Operational",
      value: metrics.healthy,
      icon: <HealthyIcon />,
      color: "#2e7d32", // Success Green
    },
    {
      label: t("appliances.stats.warranty") || "Warranty Alerts",
      value: metrics.warrantyAlert,
      icon: <ServiceIcon />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Grid container spacing={compactView ? 2 : 3} sx={{ mb: 4 }}>
      {statCards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
          <Paper
            elevation={0}
            sx={{
              p: compactView ? 2 : 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: alpha(card.color, 0.2),
              background:
                theme.palette.mode === "dark"
                  ? alpha(card.color, 0.05)
                  : alpha(card.color, 0.02),
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -10,
                right: -10,
                opacity: 0.1,
                transform: "scale(2.5)",
                color: card.color,
              }}
            >
              {card.icon}
            </Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight="bold"
              gutterBottom
            >
              {card.label}
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: card.color }}
            >
              {card.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default AppliancesStats;
