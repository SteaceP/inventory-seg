import React, { useState } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import { useTranslation } from "@/i18n";
import type { MasterLocation } from "@/types/inventory";

interface LocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    parent_id: string | null;
    description: string;
  }) => Promise<void>;
  editingLocation: MasterLocation | null;
  locations: MasterLocation[];
  loading: boolean;
}

const LocationDialog: React.FC<LocationDialogProps> = ({
  open,
  onClose,
  onSave,
  editingLocation,
  locations,
  loading,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: editingLocation?.name || "",
    parent_id: editingLocation?.parent_id || null,
    description: editingLocation?.description || "",
  });

  const handleSave = async () => {
    if (!formData.name) return;
    await onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingLocation
          ? t("inventory.locations.edit")
          : t("inventory.locations.add")}
      </DialogTitle>
      <DialogContent
        sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TextField
          id="location-name"
          name="name"
          autoFocus
          label={t("inventory.locations.name")}
          fullWidth
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Warehouse A, Shelf 1"
          slotProps={{ htmlInput: { "data-testid": "location-name-input" } }}
        />

        <TextField
          id="location-parent"
          name="parent_id"
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
          id="location-description"
          name="description"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Optional description of this location..."
          slotProps={{
            htmlInput: { "data-testid": "location-description-input" },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
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
  );
};

export default LocationDialog;
