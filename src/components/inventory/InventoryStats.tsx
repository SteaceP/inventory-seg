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
}

const InventoryStats: React.FC<InventoryStatsProps> = ({
  items,
  globalThreshold,
  categories,
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

      if (item.stock === 0) outOfStock++;
      else if (item.stock <= effectiveThreshold) lowStock++;
    });

    return {
      total: items.length,
      lowStock,
      outOfStock,
    };
  }, [items, globalThreshold, categories]);

  const statCards = [
    {
      label: t("inventory.stats.totalItems"),
      value: stats.total,
      icon: <InventoryIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: t("inventory.stats.lowStock"),
      value: stats.lowStock,
      icon: <WarningIcon />,
      color: theme.palette.warning.main,
    },
    {
      label: t("inventory.stats.outOfStock"),
      value: stats.outOfStock,
      icon: <ErrorIcon />,
      color: theme.palette.error.main,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {statCards.map((card) => {
        return (
          <Grid
            size={{ xs: 12, sm: 4, md: 4 }}
            key={card.label}
            sx={{ display: "flex" }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid",
                borderColor: alpha(card.color, 0.2),
                bgcolor:
                  theme.palette.mode === "dark"
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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px -10px ${alpha(card.color, 0.3)}`,
                  borderColor: alpha(card.color, 0.4),
                },
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
                variant="caption"
                color="text.secondary"
                fontWeight="900"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  mb: 0.5,
                }}
              >
                {card.label}
              </Typography>
              <Typography
                variant="h4"
                fontWeight="900"
                sx={{ color: card.color, letterSpacing: "-0.02em" }}
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
