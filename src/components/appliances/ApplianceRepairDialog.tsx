import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { Appliance, Repair, RepairPart } from "../../types/appliances";
import { generateSecureId } from "../../utils/crypto";

interface ApplianceRepairDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (repair: Partial<Repair>) => void;
  appliance: Appliance | null;
  loading?: boolean;
}

const ApplianceRepairDialog: React.FC<ApplianceRepairDialogProps> = ({
  open,
  onClose,
  onSave,
  appliance,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Repair>>({
    repair_date: new Date().toISOString().split("T")[0],
    description: "",
    parts: [],
    service_provider: "",
  });

  const handleChange =
    (field: keyof Repair) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleAddPart = () => {
    const parts = [
      ...(formData.parts || []),
      { id: generateSecureId("PRT"), name: "", price: 0 },
    ];
    setFormData({ ...formData, parts });
  };

  const handleRemovePart = (index: number) => {
    const parts = (formData.parts || []).filter((_, i) => i !== index);
    setFormData({ ...formData, parts });
  };

  const handlePartChange =
    (index: number, field: keyof RepairPart) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parts = [...(formData.parts || [])];
      const value =
        field === "price"
          ? parseFloat(event.target.value) || 0
          : event.target.value;
      parts[index] = { ...parts[index], [field]: value };
      setFormData({ ...formData, parts });
    };

  const calculateTotal = () => {
    return (formData.parts || []).reduce(
      (sum, part) => sum + (part.price || 0),
      0
    );
  };

  const handleSave = () => {
    onSave(formData);
    setFormData({
      repair_date: new Date().toISOString().split("T")[0],
      description: "",
      parts: [],
      service_provider: "",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{`${t("appliances.addRepair")} ${appliance?.name || ""}`}</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <TextField
          autoFocus
          margin="dense"
          label={t("appliances.repairDescription")}
          fullWidth
          multiline
          rows={2}
          value={formData.description || ""}
          onChange={handleChange("description")}
        />
        <TextField
          margin="dense"
          label={t("appliances.date")}
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={formData.repair_date || ""}
          onChange={handleChange("repair_date")}
        />

        <Box
          sx={{
            mt: 3,
            mb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {t("appliances.parts")}
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddPart}
            variant="outlined"
          >
            {t("appliances.addPart")}
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {formData.parts?.map((part, index) => (
          <Box
            // eslint-disable-next-line react-x/no-array-index-key
            key={index}
            sx={{ display: "flex", gap: 1, mb: 2, alignItems: "flex-start" }}
          >
            <TextField
              size="small"
              label={t("appliances.partName")}
              sx={{ flex: 3 }}
              value={part.name}
              onChange={handlePartChange(index, "name")}
            />
            <TextField
              size="small"
              label={t("appliances.partPrice")}
              type="number"
              sx={{ flex: 1 }}
              value={part.price || ""}
              onChange={handlePartChange(index, "price")}
            />
            <IconButton color="error" onClick={() => handleRemovePart(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        {formData.parts && formData.parts.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="h6" color="primary.main">
              {t("appliances.totalCost")}: {calculateTotal().toFixed(2)} $
            </Typography>
          </Box>
        )}

        <TextField
          margin="dense"
          label={t("appliances.serviceProvider")}
          fullWidth
          sx={{ mt: 3 }}
          value={formData.service_provider || ""}
          onChange={handleChange("service_provider")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("appliances.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!formData.description || loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {t("appliances.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplianceRepairDialog;
