import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useTranslation } from "../../i18n";
import type { Appliance, Repair } from "../../types/appliances";

interface ApplianceRepairDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (repair: Partial<Repair>) => void;
  appliance: Appliance | null;
}

const ApplianceRepairDialog: React.FC<ApplianceRepairDialogProps> = ({
  open,
  onClose,
  onSave,
  appliance,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Repair>>({
    repair_date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (field: keyof Repair) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value: string | number = event.target.value;
    if (field === "cost") {
      value = parseFloat(value) || 0;
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    onSave(formData);
    setFormData({ repair_date: new Date().toISOString().split("T")[0] });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{`${t("appliances.addRepair")} ${
        appliance?.name || ""
      }`}</DialogTitle>
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
        <TextField
          margin="dense"
          label={t("appliances.cost")}
          type="number"
          fullWidth
          value={formData.cost || ""}
          onChange={handleChange("cost")}
        />
        <TextField
          margin="dense"
          label={t("appliances.serviceProvider")}
          fullWidth
          value={formData.service_provider || ""}
          onChange={handleChange("service_provider")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("appliances.cancel")}</Button>
        <Button onClick={handleSave} variant="contained">
          {t("appliances.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplianceRepairDialog;
