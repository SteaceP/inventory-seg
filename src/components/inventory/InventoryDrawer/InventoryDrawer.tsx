import React from "react";
import { useInventoryContext } from "@contexts/InventoryContext";
import { useUserContext } from "@contexts/UserContext";
import {
  Drawer,
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Label as LabelIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Description as NotesIcon,
} from "@mui/icons-material";
import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";
import InventoryActivityLog from "../shared/InventoryActivityLog";
import InventoryDrawerHeader from "./InventoryDrawerHeader";
import InventoryDrawerDetails from "./InventoryDrawerDetails";
import InventoryDrawerLocations from "./InventoryDrawerLocations";
import InventoryDrawerActions from "./InventoryDrawerActions";

interface InventoryDrawerProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (item: InventoryItem) => void;
}

const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  open,
  item,
  onClose,
  onEdit,
  onDelete,
  onAdjustStock,
}) => {
  const { t } = useTranslation();
  const { categories } = useInventoryContext();
  const { lowStockThreshold: globalThreshold } = useUserContext();

  if (!item) return null;

  const category = categories.find(
    (c: { name: string; low_stock_threshold: number | null }) =>
      c.name === item.category
  );
  const effectiveThreshold =
    item.low_stock_threshold !== null
      ? item.low_stock_threshold
      : category?.low_stock_threshold !== null &&
          category?.low_stock_threshold !== undefined
        ? category.low_stock_threshold
        : globalThreshold;

  const isLowStock = (item.stock || 0) <= (effectiveThreshold ?? 0);
  const isOutOfStock = (item.stock || 0) === 0;

  const getStockColor = () => {
    if (isOutOfStock) return "error";
    if (isLowStock) return "warning";
    return "success";
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: "100%", sm: 500 }, bgcolor: "background.default" },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <InventoryDrawerHeader name={item.name} onClose={onClose} />

        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3 } }}>
          {item.image_url ? (
            <Paper
              elevation={4}
              sx={{
                width: "100%",
                height: 250,
                borderRadius: 4,
                overflow: "hidden",
                mb: 3,
                backgroundImage: `url(${item.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 120,
                borderRadius: 4,
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <InventoryIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            </Box>
          )}

          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 3 }}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={item.category}
              color="primary"
              variant="filled"
              sx={{ fontWeight: "bold" }}
            />
            {item.sku && (
              <Chip
                icon={<LabelIcon fontSize="small" />}
                label={item.sku}
                variant="outlined"
              />
            )}
            <Chip
              label={`${item.stock} ${t("inventory.stock")}`}
              color={getStockColor()}
              variant="outlined"
              sx={{ fontWeight: "bold" }}
            />
          </Stack>

          {item.notes && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                bgcolor: "action.hover",
                borderStyle: "dashed",
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <NotesIcon fontSize="small" /> {t("inventory.notes")}
              </Typography>
              <Typography variant="body2">{item.notes}</Typography>
            </Paper>
          )}

          <InventoryDrawerDetails
            effectiveThreshold={effectiveThreshold ?? 0}
          />
          <InventoryDrawerLocations item={item} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <HistoryIcon fontSize="small" color="primary" />{" "}
              {t("inventory.drawer.history")}
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                if (item) onAdjustStock(item);
              }}
            >
              {t("inventory.manageStock")}
            </Button>
          </Box>

          <InventoryActivityLog itemId={item.id} />
        </Box>

        <InventoryDrawerActions
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Box>
    </Drawer>
  );
};

export default InventoryDrawer;
