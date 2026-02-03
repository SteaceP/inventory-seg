import React from "react";
import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";
import { generateSecureId } from "@utils/crypto";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import AutoRenewIcon from "@mui/icons-material/Autorenew";

interface ApplianceMainFieldsProps {
  formData: Partial<Appliance>;
  setFormData: (data: Partial<Appliance>) => void;
  handleChange: (
    field: keyof Appliance
  ) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ApplianceMainFields: React.FC<ApplianceMainFieldsProps> = ({
  formData,
  setFormData,
  handleChange,
}) => {
  const { t } = useTranslation();

  const generateSKU = () => {
    const sku = generateSecureId("APP");
    setFormData({ ...formData, sku });
  };

  return (
    <>
      <Grid size={{ xs: 12, md: 8 }}>
        <TextField
          autoFocus
          margin="dense"
          label={t("appliances.nameLabel")}
          fullWidth
          value={formData.name || ""}
          onChange={handleChange("name")}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          select
          margin="dense"
          label={t("appliances.status.title")}
          fullWidth
          value={formData.status || "functional"}
          onChange={handleChange("status" as keyof Appliance)}
        >
          <MenuItem value="functional">
            {t("appliances.status.functional")}
          </MenuItem>
          <MenuItem value="needs_service">
            {t("appliances.status.needsService")}
          </MenuItem>
          <MenuItem value="broken">{t("appliances.status.broken")}</MenuItem>
        </TextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          margin="dense"
          label={t("appliances.skuLabel")}
          fullWidth
          value={formData.sku || ""}
          onChange={handleChange("sku")}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={generateSKU}
                    edge="end"
                    title={t("appliances.generateSku")}
                  >
                    <AutoRenewIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          margin="dense"
          label={t("appliances.serialLabel")}
          fullWidth
          value={formData.serial_number || ""}
          onChange={handleChange("serial_number")}
        />
      </Grid>
    </>
  );
};

export default ApplianceMainFields;
