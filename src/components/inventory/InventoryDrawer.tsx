import React, { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Paper,
  Stack,
  LinearProgress,
  AppBar,
  Toolbar,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Label as LabelIcon,
  History as HistoryIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Description as NotesIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { InventoryItem } from "../../types/inventory";
import { supabase } from "../../supabaseClient";

interface InventoryDrawerProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (item: InventoryItem) => void;
  globalThreshold: number;
  categories: { name: string; low_stock_threshold: number | null }[];
}

interface StockActivity {
  id: string;
  created_at: string;
  action: string;
  changes?: {
    action_type?: string;
    stock?: number;
    old_stock?: number;
    location?: string;
    [key: string]: unknown;
  };
}

const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  open,
  onClose,
  item,
  onEdit,
  onDelete,
  onAdjustStock,
  globalThreshold,
  categories,
}) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<StockActivity[]>([]);

  const fetchActivity = useCallback(async () => {
    if (!item?.id) return;
    try {
      const { data, error } = await supabase
        .from("inventory_activity")
        .select("*")
        .eq("inventory_id", item.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error("Error fetching activity:", err);
    }
  }, [item?.id]);

  useEffect(() => {
    if (open && item?.id) {
      void fetchActivity();
    }
  }, [open, item?.id, fetchActivity]);

  if (!item) return null;

  const categoryThreshold = categories.find(
    (c) => c.name === item.category
  )?.low_stock_threshold;

  const effectiveThreshold =
    item.low_stock_threshold ?? categoryThreshold ?? globalThreshold;

  const isLowStock = (item.stock || 0) <= effectiveThreshold;
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
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            backdropFilter: "blur(20px)",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(18, 18, 18, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              {item.name}
            </Typography>
            <IconButton onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

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

          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <InventoryIcon fontSize="small" color="primary" />{" "}
            {t("inventory.drawer.details")}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {t("inventory.lowStock")} Threshold
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {effectiveThreshold}
              </Typography>
            </Grid>
          </Grid>

          {item.stock_locations && item.stock_locations.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <LocationIcon fontSize="small" color="primary" />{" "}
                {t("inventory.drawer.locations")}
              </Typography>
              <Stack spacing={1.5}>
                {item.stock_locations.map((loc, idx) => (
                  <Box key={loc.id || idx}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {loc.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {loc.quantity}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        100,
                        (loc.quantity / (item.stock || 1)) * 100
                      )}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

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
              onClick={() => onAdjustStock(item)}
            >
              {t("inventory.manageStock")}
            </Button>
          </Box>

          <Stack spacing={2}>
            {activities.length === 0 ? (
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "action.hover",
                  borderRadius: 3,
                }}
              >
                <HistoryIcon
                  sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("inventory.drawer.noHistory")}
                </Typography>
              </Paper>
            ) : (
              activities.map((activity) => (
                <Paper
                  key={activity.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 3 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(activity.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  {activity.changes?.action_type && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {activity.changes.action_type === "add" ? "+" : "-"}
                      {Math.abs(
                        (activity.changes.stock || 0) -
                          (activity.changes.old_stock || 0)
                      )}{" "}
                      units
                    </Typography>
                  )}
                  {activity.changes?.location && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="primary"
                    >
                      {activity.changes.location}
                    </Typography>
                  )}
                </Paper>
              ))
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => onEdit(item)}
          >
            {t("inventory.edit")}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (item.id) onDelete(item.id);
            }}
          >
            {t("inventory.delete")}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default InventoryDrawer;
