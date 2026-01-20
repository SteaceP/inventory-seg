import React, { useState, useEffect, useCallback } from "react";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useUserContext } from "../../contexts/UserContext";
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
  ListItemText,
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
}

interface ActivityLog {
  id: string;
  created_at: string | null;
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
  item,
  onClose,
  onEdit,
  onDelete,
  onAdjustStock,
}) => {
  const { t } = useTranslation();
  const { categories } = useInventoryContext();
  const { lowStockThreshold: globalThreshold } = useUserContext();
  // Removed showError as it was unused
  const { handleError } = useErrorHandler();
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  const fetchActivity = useCallback(async () => {
    if (!item?.id) return;
    try {
      const { data, error } = await supabase
        .from("inventory_activity")
        .select("*")
        .eq("inventory_id", item.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setActivity((data as ActivityLog[]) || []);
    } catch (err: unknown) {
      handleError(
        err,
        t("errors.loadActivity") + ": " + (err as Error).message
      );
    } finally {
      // Optional: Add any cleanup or finalization logic here
    }
  }, [item?.id, handleError, t]); // Added handleError and t to dependencies

  useEffect(() => {
    if (open && item?.id) {
      void fetchActivity();
    }
  }, [open, item?.id, fetchActivity]);

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
                        {loc.quantity ?? 0}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        100,
                        ((loc.quantity || 0) / (item.stock || 1)) * 100
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
              onClick={() => {
                if (item) onAdjustStock(item);
              }}
            >
              {t("inventory.manageStock")}
            </Button>
          </Box>

          <Stack spacing={2}>
            {activity.length === 0 ? (
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
              activity.map((log) => (
                <Paper
                  key={log.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 3 }}
                >
                  <ListItemText
                    primary={log.action}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString()
                            : ""}
                        </Typography>
                        {log.changes && (
                          <Box component="span" sx={{ display: "block" }}>
                            {log.changes.action_type && (
                              <Typography component="span" variant="caption">
                                Action: {log.changes.action_type}
                              </Typography>
                            )}
                            {log.changes.stock !== undefined && (
                              <Typography component="span" variant="caption">
                                New Stock: {log.changes.stock}
                              </Typography>
                            )}
                            {log.changes.old_stock !== undefined && (
                              <Typography component="span" variant="caption">
                                (Was: {log.changes.old_stock})
                              </Typography>
                            )}
                            {log.changes.location && (
                              <Typography
                                component="span"
                                variant="caption"
                                display="block"
                                color="primary"
                              >
                                {log.changes.location}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </React.Fragment>
                    }
                  />
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
            onClick={() => {
              if (item) onEdit(item);
            }}
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
