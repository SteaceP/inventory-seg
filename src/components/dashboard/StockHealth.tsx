import React from "react";
import { Box, Paper, Typography, alpha, CircularProgress } from "@mui/material";
import {
  CheckCircle as HealthyIcon,
  Error as CrisisIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useUserContext } from "../../contexts/UserContext";

const StockHealth: React.FC = () => {
  const { t } = useTranslation();
  const { items, categories: contextCategories } = useInventoryContext();
  const { lowStockThreshold } = useUserContext();

  const health = React.useMemo(() => {
    if (!items || items.length === 0) return 100;

    const issues = items.filter((item) => {
      const categoryThreshold = contextCategories.find(
        (c) => c.name === item.category
      )?.low_stock_threshold;

      const effectiveThreshold =
        item.low_stock_threshold ?? categoryThreshold ?? lowStockThreshold;

      return (item.stock || 0) <= (effectiveThreshold || 0);
    }).length;

    return Math.round(((items.length - issues) / items.length) * 100);
  }, [items, lowStockThreshold, contextCategories]);

  const getColor = (score: number) => {
    if (score > 80) return "#027d6f";
    if (score > 50) return "#d29922";
    return "#d1242f";
  };

  const statusColor = getColor(health);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(statusColor, 0.2),
        background: `linear-gradient(135deg, ${alpha(statusColor, 0.05)} 0%, ${alpha(statusColor, 0.01)} 100%)`,
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        gap: 4,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={120}
          thickness={4}
          sx={{ color: alpha(statusColor, 0.1) }}
        />
        <CircularProgress
          variant="determinate"
          value={health}
          size={120}
          thickness={5}
          sx={{
            color: statusColor,
            position: "absolute",
            left: 0,
            strokeLinecap: "round",
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{ color: statusColor, lineHeight: 1 }}
          >
            {health}%
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight="900">
            {t("dashboard.health.title")}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {health > 80 ? (
            <HealthyIcon sx={{ color: statusColor }} />
          ) : (
            <CrisisIcon sx={{ color: statusColor }} />
          )}
          <Typography variant="h6" fontWeight="900">
            {health > 80
              ? t("dashboard.health.excellent")
              : health > 50
                ? t("dashboard.health.good")
                : t("dashboard.health.critical")}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {health > 80
            ? t("dashboard.health.descGood")
            : t("dashboard.health.descLow")}
        </Typography>
      </Box>

      {/* Decorative background circle */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(statusColor, 0.1)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
    </Paper>
  );
};

export default StockHealth;
