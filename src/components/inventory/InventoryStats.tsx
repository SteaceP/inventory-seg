import React from "react";
import { Grid, Paper, Typography, Box, alpha, useTheme } from "@mui/material";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { InventoryItem } from "../../types/inventory";

interface InventoryStatsProps {
  items: InventoryItem[];
  globalThreshold: number;
  categories: { name: string; low_stock_threshold: number | null }[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({
  items,
  globalThreshold,
  categories,
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const stats = React.useMemo(() => {
    let lowStock = 0;
    let outOfStock = 0;

    items.forEach((item) => {
      const categoryThreshold = categories.find(
        (c) => c.name === item.category
      )?.low_stock_threshold;

      const effectiveThreshold =
        item.low_stock_threshold ?? categoryThreshold ?? globalThreshold;

      if ((item.stock || 0) === 0) outOfStock++;
      else if ((item.stock || 0) <= effectiveThreshold) lowStock++;
    });

    return {
      total: items.length,
      lowStock,
      outOfStock,
    };
  }, [items, globalThreshold, categories]);

  const statCards = [
    {
      index: 0,
      label: t("inventory.stats.totalItems"),
      value: stats.total,
      icon: <InventoryIcon />,
      color: theme.palette.primary.main,
    },
    {
      index: 1,
      label: t("inventory.stats.lowStock"),
      value: stats.lowStock,
      icon: <WarningIcon />,
      color: theme.palette.warning.main,
    },
    {
      index: 2,
      label: t("inventory.stats.outOfStock"),
      value: stats.outOfStock,
      icon: <ErrorIcon />,
      color: theme.palette.error.main,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {statCards.map((card) => {
        const isActive = activeTab === card.index;
        return (
          <Grid
            size={{ xs: 12, sm: 4, md: 4 }}
            key={card.label}
            sx={{ display: "flex" }}
          >
            <Paper
              elevation={isActive ? 8 : 0}
              onClick={() => onTabChange(card.index)}
              sx={{
                p: 2.5,
                borderRadius: 4,
                cursor: "pointer",
                border: "2px solid",
                borderColor: isActive ? card.color : alpha(card.color, 0.2),
                bgcolor: isActive
                  ? alpha(card.color, 0.08)
                  : theme.palette.mode === "dark"
                    ? alpha(card.color, 0.05)
                    : alpha(card.color, 0.02),
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(10px)",
                boxShadow: isActive
                  ? `0 0 20px ${alpha(card.color, 0.25)}`
                  : "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 12px 28px -10px ${alpha(card.color, 0.4)}`,
                  borderColor: isActive ? card.color : alpha(card.color, 0.4),
                  bgcolor: isActive
                    ? alpha(card.color, 0.12)
                    : alpha(card.color, 0.08),
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  opacity: isActive ? 0.2 : 0.1,
                  transform: isActive ? "scale(3)" : "scale(2.5)",
                  color: card.color,
                  transition: "all 0.3s ease",
                }}
              >
                {card.icon}
              </Box>
              <Typography
                variant="caption"
                color={isActive ? "text.primary" : "text.secondary"}
                fontWeight="900"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  mb: 0.5,
                  transition: "color 0.3s ease",
                }}
              >
                {card.label}
              </Typography>
              <Typography
                variant="h4"
                fontWeight="900"
                sx={{
                  color: card.color,
                  letterSpacing: "-0.02em",
                  textShadow: isActive
                    ? `0 2px 10px ${alpha(card.color, 0.2)}`
                    : "none",
                }}
              >
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default InventoryStats;
