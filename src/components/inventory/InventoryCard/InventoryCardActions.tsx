import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useTheme, alpha } from "@mui/material/styles";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExposureIcon from "@mui/icons-material/Exposure";
import HistoryIcon from "@mui/icons-material/History";

import type { InventoryItem } from "@/types/inventory";

interface InventoryCardActionsProps {
  item: InventoryItem;
  isAdmin: boolean;
  onViewHistory?: (itemId: string, itemName: string) => void;
  onAdjust?: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  t: (
    key: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ) => string;
}

const InventoryCardActions: React.FC<InventoryCardActionsProps> = ({
  item,
  isAdmin,
  onViewHistory,
  onAdjust,
  onEdit,
  onDelete,
  t,
}) => {
  const theme = useTheme();

  return (
    <CardActions
      sx={{
        p: 1.5,
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.default, 0.8)
            : alpha(theme.palette.action.hover, 0.9),
        borderTop: "1px solid",
        borderColor: "divider",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        size="small"
        startIcon={<HistoryIcon />}
        onClick={() => onViewHistory?.(item.id, item.name)}
        sx={{
          fontWeight: "bold",
          color: theme.palette.text.primary,
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
      >
        {t("inventory.history") || "History"}
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" spacing={0.5}>
        <IconButton
          size="small"
          onClick={() => onAdjust?.(item)}
          aria-label={t("inventory.manageStock") || "Manage stock"}
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: "success.main",
            "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.2) },
          }}
        >
          <ExposureIcon fontSize="small" />
        </IconButton>

        {isAdmin && (
          <>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(item)}
              aria-label={t("inventory.edit") || "Edit item"}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete?.(item.id)}
              aria-label={t("inventory.delete") || "Delete"}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.05),
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.15),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Stack>
    </CardActions>
  );
};

export default InventoryCardActions;
