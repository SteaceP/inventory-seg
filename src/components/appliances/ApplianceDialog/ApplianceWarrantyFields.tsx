import React from "react";
import { Grid, TextField } from "@mui/material";
import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";

interface ApplianceWarrantyFieldsProps {
  formData: Partial<Appliance>;
  handleChange: (
    field: keyof Appliance
  ) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ApplianceWarrantyFields: React.FC<ApplianceWarrantyFieldsProps> = ({
  formData,
  handleChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          margin="dense"
          label={t("appliances.purchaseDate")}
          type="date"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          value={formData.purchase_date || ""}
          onChange={handleChange("purchase_date")}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          margin="dense"
          label={t("appliances.warrantyExpiry")}
          type="date"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          value={formData.warranty_expiry || ""}
          onChange={handleChange("warranty_expiry")}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          margin="dense"
          label={t("appliances.expectedLife")}
          type="number"
          fullWidth
          value={formData.expected_life || 10}
          onChange={handleChange("expected_life")}
        />
      </Grid>
    </>
  );
};

export default ApplianceWarrantyFields;
