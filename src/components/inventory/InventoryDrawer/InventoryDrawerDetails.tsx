import React from "react";
import { Grid, Typography } from "@mui/material";
import { Inventory as InventoryIcon } from "@mui/icons-material";
import { useTranslation } from "../../../i18n";

interface InventoryDrawerDetailsProps {
  effectiveThreshold: number;
}

const InventoryDrawerDetails: React.FC<InventoryDrawerDetailsProps> = ({
  effectiveThreshold,
}) => {
  const { t } = useTranslation();

  return (
    <>
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
          <Typography variant="caption" color="text.secondary" display="block">
            {t("inventory.lowStockThresholdLabel") || "Seuil de stock bas"}
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {effectiveThreshold}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default InventoryDrawerDetails;
