import React from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import { useTheme, alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import type { InventoryItem } from "@/types/inventory";

interface InventoryCardStockProps {
  item: InventoryItem;
  effectiveThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  t: (
    key: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ) => string;
}

const InventoryCardStock: React.FC<InventoryCardStockProps> = ({
  item,
  effectiveThreshold,
  isLowStock,
  isOutOfStock,
  t,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 2 }}>
      {(isLowStock || isOutOfStock) && (
        <Chip
          label={
            isOutOfStock
              ? t("inventory.stats.outOfStock")
              : t("inventory.stats.lowStock")
          }
          size="small"
          color={isOutOfStock ? "error" : "warning"}
          sx={{
            bgcolor: (theme) =>
              alpha(
                isOutOfStock
                  ? theme.palette.error.main
                  : theme.palette.warning.main,
                0.1
              ),
            color: isOutOfStock ? "error.main" : "warning.main",
            fontWeight: "bold",
            borderRadius: 1,
            mb: 1.5,
          }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          mb: 1,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{
              color: isOutOfStock
                ? "error.main"
                : isLowStock
                  ? "warning.main"
                  : "text.primary",
              lineHeight: 1,
              display: "inline-block",
            }}
          >
            {item.stock}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="900"
            sx={{ ml: 1, textTransform: "uppercase", letterSpacing: 1 }}
          >
            {t("inventory.stockUnits")}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          fontWeight="900"
          color="text.secondary"
          sx={{
            opacity: 0.8,
            bgcolor: alpha(theme.palette.divider, 0.05),
            px: 1.25,
            py: 0.5,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
            letterSpacing: 0.5,
          }}
        >
          {t("inventory.minThreshold", { threshold: effectiveThreshold })}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, ((item.stock || 0) / effectiveThreshold) * 100)}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.divider, 0.1),
          "& .MuiLinearProgress-bar": {
            bgcolor: isOutOfStock
              ? "error.main"
              : isLowStock
                ? "warning.main"
                : "success.main",
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
};

export default InventoryCardStock;
