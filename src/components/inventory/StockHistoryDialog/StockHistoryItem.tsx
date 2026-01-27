import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useTranslation } from "@/i18n";
import type { InventoryActivity } from "@/types/activity";
import { getActivityNarrative, getStockChange } from "@utils/activityUtils";

interface StockHistoryItemProps {
  activity: InventoryActivity;
  formatDate: (dateString: string) => string;
}

const StockHistoryItem: React.FC<StockHistoryItemProps> = ({
  activity,
  formatDate,
}) => {
  const { t } = useTranslation();

  const getActionIcon = (
    action: string,
    changes: InventoryActivity["changes"]
  ) => {
    if (action === "created")
      return <AddIcon fontSize="small" color="success" />;
    if (action === "deleted")
      return <DeleteIcon fontSize="small" color="error" />;

    const actionType = changes?.action_type;
    if (actionType === "add")
      return <TrendingUpIcon fontSize="small" color="success" />;
    if (actionType === "remove")
      return <TrendingDownIcon fontSize="small" color="error" />;

    return <EditIcon fontSize="small" color="primary" />;
  };

  const stockChange = getStockChange(activity.changes);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px",
        "@media print": {
          boxShadow: "none",
          border: "1px solid #ddd",
          pageBreakInside: "avoid",
          mb: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getActionIcon(activity.action, activity.changes)}
          <Typography variant="subtitle2" color="text.primary">
            {getActivityNarrative(activity, t)}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {formatDate(activity.created_at)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          ml: 4,
        }}
      >
        {stockChange && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">
              Stock: {stockChange.oldStock} → {stockChange.newStock}
            </Typography>
            <Chip
              label={`${stockChange.diff > 0 ? "+" : ""}${stockChange.diff}`}
              size="small"
              color={stockChange.color as "success" | "error"}
              sx={{ height: 20, fontSize: "0.75rem" }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default StockHistoryItem;
