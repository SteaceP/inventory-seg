import React from "react";
import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import InventoryIcon from "@mui/icons-material/Inventory";

interface ApplianceDetailsGridProps {
  appliance: Appliance;
}

const ApplianceDetailsGrid: React.FC<ApplianceDetailsGridProps> = ({
  appliance,
}) => {
  const { t } = useTranslation();

  const specs = [
    {
      label: t("appliances.brand"),
      value: appliance.brand,
      key: "brand",
    },
    {
      label: t("appliances.model"),
      value: appliance.model,
      key: "model",
    },
    {
      label: t("appliances.serialLabel"),
      value: appliance.serial_number,
      key: "serial",
    },
    {
      label: t("appliances.expectedLife"),
      value: appliance.expected_life
        ? `${appliance.expected_life} ${t("common.years")}`
        : "—",
      key: "life",
    },
    {
      label: t("appliances.locationLabel"),
      value: appliance.location,
      key: "loc",
    },
  ];

  return (
    <>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        gutterBottom
        sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <InventoryIcon fontSize="small" color="primary" /> {t("common.details")}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {specs.map((spec) => (
          <Grid size={6} key={spec.key}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {spec.label}
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {spec.value || "—"}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default ApplianceDetailsGrid;
