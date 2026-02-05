import React from "react";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import LocationIcon from "@mui/icons-material/LocationOn";

import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";

interface InventoryDrawerLocationsProps {
  item: InventoryItem;
}

const InventoryDrawerLocations: React.FC<InventoryDrawerLocationsProps> = ({
  item,
}) => {
  const { t } = useTranslation();

  if (!item.stock_locations || item.stock_locations.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <LocationIcon fontSize="small" color="primary" />{" "}
        {t("inventory.drawer.locations")}
      </Typography>
      <Stack spacing={1.5}>
        {item.stock_locations.map((loc, idx) => (
          <Box key={loc.id || idx}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {loc.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loc.quantity ?? 0}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(
                100,
                ((loc.quantity || 0) / (item.stock || 1)) * 100
              )}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default InventoryDrawerLocations;
