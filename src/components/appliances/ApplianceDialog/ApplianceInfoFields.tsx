import React from "react";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";

interface ApplianceInfoFieldsProps {
  formData: Partial<Appliance>;
  handleChange: (
    field: keyof Appliance
  ) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ApplianceInfoFields: React.FC<ApplianceInfoFieldsProps> = ({
  formData,
  handleChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          margin="dense"
          label={t("appliances.brand")}
          fullWidth
          value={formData.brand || ""}
          onChange={handleChange("brand")}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          margin="dense"
          label={t("appliances.type")}
          fullWidth
          value={formData.type || ""}
          onChange={handleChange("type")}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          margin="dense"
          label={t("appliances.model")}
          fullWidth
          value={formData.model || ""}
          onChange={handleChange("model")}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          margin="dense"
          label={t("appliances.locationLabel")}
          fullWidth
          value={formData.location || ""}
          onChange={handleChange("location")}
          placeholder={t("appliances.locationPlaceholder")}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          margin="dense"
          label={t("appliances.notes")}
          fullWidth
          multiline
          rows={2}
          value={formData.notes || ""}
          onChange={handleChange("notes")}
        />
      </Grid>
    </>
  );
};

export default ApplianceInfoFields;
