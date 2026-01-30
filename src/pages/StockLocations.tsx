import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useTranslation } from "@/i18n";
import { useInventoryContext } from "@contexts/InventoryContext";
import { useAlert } from "@contexts/AlertContext";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { supabase } from "@/supabaseClient";
import type { MasterLocation } from "@/types/inventory";
import LocationList from "@components/inventory/LocationManagement/LocationList";
import LocationDialog from "@components/inventory/LocationManagement/LocationDialog";

const StockLocationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { locations, refreshInventory: refreshLocations } =
    useInventoryContext();
  const { showSuccess } = useAlert();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MasterLocation | null>(
    null
  );

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("inventory_locations")
        .select("*")
        .order("name");

      if (error) throw error;
      await refreshLocations();
    } catch (err: unknown) {
      handleError(err, "Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshLocations();
  }, [refreshLocations]);

  const handleOpenDialog = (location?: MasterLocation) => {
    setEditingLocation(location || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
  };

  const handleSave = async (formData: {
    name: string;
    parent_id: string | null;
    description: string;
  }) => {
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
      void refreshLocations();
      showSuccess(
        editingLocation
          ? t("inventory.locations.success.edit")
          : t("inventory.locations.success.add")
      );
    } catch (err) {
      handleError(err, t("inventory.locations.error.save"));
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
      void refreshLocations();
      showSuccess(t("inventory.locations.success.delete"));
    } catch (err) {
      handleError(err, t("inventory.locations.error.delete"));
    } finally {
      setLoading(false);
    }
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
          <LocationList
            locations={locations}
            onEdit={handleOpenDialog}
            onDelete={handleDelete}
          />
        )}
      </Paper>

      {openDialog && (
        <LocationDialog
          key={editingLocation?.id || "new"}
          open={openDialog}
          onClose={handleCloseDialog}
          onSave={handleSave}
          editingLocation={editingLocation}
          locations={locations}
          loading={loading}
        />
      )}
    </Container>
  );
};

export default StockLocationsPage;
