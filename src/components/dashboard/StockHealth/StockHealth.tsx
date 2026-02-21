import React from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import { useTheme, alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import HealthyIcon from "@mui/icons-material/CheckCircle";
import CrisisIcon from "@mui/icons-material/Error";

import { useTranslation } from "@/i18n";

import { useInventoryContext } from "@contexts/InventoryContext";
import { useUserContext } from "@contexts/UserContextDefinition";

const StockHealth: React.FC = () => {
  const { t } = useTranslation();
  const { items, categories: contextCategories } = useInventoryContext();
  const { lowStockThreshold } = useUserContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    if (score > 80) return theme.palette.status.success;
    if (score > 50) return theme.palette.status.warning;
    return theme.palette.status.error;
  };

  const statusColor = getColor(health);
  const circleSize = isMobile ? 80 : 120;

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 2 : 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(statusColor, 0.2),
        background: `linear-gradient(135deg, ${alpha(statusColor, 0.05)} 0%, ${alpha(statusColor, 0.01)} 100%)`,
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        gap: isMobile ? 2 : 4,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={circleSize}
          thickness={4}
          sx={{ color: alpha(statusColor, 0.1) }}
        />
        <CircularProgress
          variant="determinate"
          value={health}
          size={circleSize}
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
            variant={isMobile ? "h5" : "h4"}
            fontWeight="900"
            sx={{ color: statusColor, lineHeight: 1 }}
          >
            {health}%
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="900"
            sx={{ fontSize: isMobile ? "0.65rem" : undefined }}
          >
            {t("dashboard.health.title")}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-start" },
            gap: 1,
            mb: 1,
          }}
        >
          {health > 80 ? (
            <HealthyIcon
              sx={{
                color: statusColor,
                fontSize: isMobile ? "1.25rem" : "1.5rem",
              }}
            />
          ) : (
            <CrisisIcon
              sx={{
                color: statusColor,
                fontSize: isMobile ? "1.25rem" : "1.5rem",
              }}
            />
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="900">
            {health > 80
              ? t("dashboard.health.excellent")
              : health > 50
                ? t("dashboard.health.good")
                : t("dashboard.health.critical")}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: isMobile ? "0.75rem" : undefined }}
        >
          {health > 80
            ? t("dashboard.health.descGood")
            : t("dashboard.health.descLow")}
        </Typography>
      </Box>

      {/* Decorative background circle */}
      <Box
        sx={{
          position: "absolute",
          top: -5,
          right: -5,
          width: isMobile ? 100 : 140,
          height: isMobile ? 100 : 140,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(statusColor, 0.08)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
    </Paper>
  );
};

export default StockHealth;
