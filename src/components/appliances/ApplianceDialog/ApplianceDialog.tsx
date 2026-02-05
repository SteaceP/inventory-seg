import React, { useState } from "react";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";

import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";

import ApplianceImageUpload from "./ApplianceImageUpload";
import ApplianceInfoFields from "./ApplianceInfoFields";
import ApplianceMainFields from "./ApplianceMainFields";
import ApplianceWarrantyFields from "./ApplianceWarrantyFields";

interface ApplianceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (appliance: Partial<Appliance>) => void;
  initialData?: Partial<Appliance>;
  loading?: boolean;
}

const ApplianceDialog: React.FC<ApplianceDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData = {},
  loading = false,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Partial<Appliance>>({
    status: "functional",
    expected_life: 10,
    ...initialData,
  });

  const isEdit = !!initialData.id;

  const handleChange =
    (field: keyof Appliance) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target.type === "number"
          ? Number(event.target.value)
          : event.target.value;
      setFormData({ ...formData, [field]: value });
    };

  const handleSave = () => {
    onSave(formData);
    if (!isEdit) setFormData({ status: "functional", expected_life: 10 });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle fontWeight="bold">
        {isEdit ? t("appliances.edit") : t("appliances.add")}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <ApplianceMainFields
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
          />

          <ApplianceWarrantyFields
            formData={formData}
            handleChange={handleChange}
          />

          <ApplianceInfoFields
            formData={formData}
            handleChange={handleChange}
          />
        </Grid>

        <ApplianceImageUpload
          photoUrl={formData.photo_url}
          onUploadSuccess={(url) =>
            setFormData({ ...formData, photo_url: url })
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t("appliances.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
          sx={{ px: 4 }}
        >
          {isEdit ? t("common.save") : t("appliances.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplianceDialog;
