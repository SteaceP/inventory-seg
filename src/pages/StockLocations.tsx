import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Folder as FolderIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useTranslation } from "../i18n";
import { supabase } from "../supabaseClient";
import { useAlert } from "../contexts/AlertContext";
import type { MasterLocation } from "../types/inventory";

const StockLocationsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<MasterLocation[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MasterLocation | null>(
    null
  );

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "" as string | null,
    description: "",
  });

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory_locations")
        .select("*")
        .order("name");

      if (error) throw error;
      setLocations(data || []);
    } catch (err: unknown) {
      showError("Failed to fetch locations: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void fetchLocations();
  }, [fetchLocations]);

  const handleOpenDialog = (location?: MasterLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        parent_id: location.parent_id,
        description: location.description || "",
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        parent_id: null,
        description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
  };

  const handleSave = async () => {
    if (!formData.name) return;

    try {
      setLoading(true);
      if (editingLocation) {
        const { error } = await supabase
          .from("inventory_locations")
          .update(formData)
          .eq("id", editingLocation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("inventory_locations")
          .insert([formData]);
        if (error) throw error;
      }

      handleCloseDialog();
      void fetchLocations();
    } catch (err) {
      console.error("Error saving location:", err);
      const error = err as { code?: string };
      if (error.code === "23505") {
        showError(t("inventory.locations.error.duplicate"));
      } else {
        showError(t("inventory.locations.error.save"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("inventory.locations.deleteConfirm"))) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("inventory_locations")
        .delete()
        .eq("id", id);
      if (error) throw error;
      void fetchLocations();
    } catch (err) {
      console.error("Error deleting location:", err);
      showError(t("inventory.locations.error.delete"));
    } finally {
      setLoading(false);
    }
  };

  // Helper to build hierarchy
  const buildHierarchy = (parentId: string | null = null, depth = 0) => {
    return locations
      .filter((l) => l.parent_id === parentId)
      .map((location) => (
        <React.Fragment key={location.id}>
          <ListItem
            sx={{
              pl: 4 * depth + 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mr: 2,
                color: location.parent_id ? "text.secondary" : "primary.main",
              }}
            >
              {location.parent_id ? (
                <LocationIcon fontSize="small" />
              ) : (
                <FolderIcon />
              )}
            </Box>
            <ListItemText
              primary={location.name}
              secondary={location.description}
              primaryTypographyProps={{
                fontWeight: location.parent_id ? "medium" : "bold",
              }}
            />
            <ListItemSecondaryAction>
              <IconButton
                onClick={() => handleOpenDialog(location)}
                size="small"
                sx={{ mr: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => {
                  void handleDelete(location.id);
                }}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {buildHierarchy(location.id, depth + 1)}
        </React.Fragment>
      ));
  };

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1200px" }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          {t("inventory.locations.management")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <IconButton
            onClick={() => {
              void fetchLocations();
            }}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: "8px" }}
          >
            {t("inventory.locations.add")}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: "12px", overflow: "hidden" }}>
        {loading && locations.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : locations.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="text.secondary">
              {t("inventory.locations.noLocations")}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>{buildHierarchy(null)}</List>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingLocation
            ? t("inventory.locations.edit")
            : t("inventory.locations.add")}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            autoFocus
            label={t("inventory.locations.name")}
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Warehouse A, Shelf 1"
          />

          <TextField
            select
            label={t("inventory.locations.parent")}
            fullWidth
            value={formData.parent_id || ""}
            onChange={(e) =>
              setFormData({ ...formData, parent_id: e.target.value || null })
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {locations
              .filter((l) => l.id !== editingLocation?.id) // Prevent self-referencing
              .map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Optional description of this location..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={() => {
              void handleSave();
            }}
            disabled={!formData.name || loading}
          >
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StockLocationsPage;
