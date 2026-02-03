import React from "react";
import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";
import type { SelectedLocation } from "./types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import LocationIcon from "@mui/icons-material/LocationOn";

interface AdjustmentQuickInfoProps {
  item: InventoryItem;
  selectedLocation: SelectedLocation | null;
}

const AdjustmentQuickInfo: React.FC<AdjustmentQuickInfoProps> = ({
  item,
  selectedLocation,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 0.5, mb: 2 }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="600"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "200px",
          }}
        >
          {item.name}
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: "12px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            boxShadow: "0 2px 8px rgba(2, 125, 111, 0.2)",
          }}
        >
          <Typography variant="caption" fontWeight="900">
            {item.stock}
          </Typography>
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{ fontSize: "0.65rem", opacity: 0.9 }}
          >
            IN STOCK
          </Typography>
        </Box>
      </Box>

      {selectedLocation && (
        <Box sx={{ px: 0, pt: 1, pb: 1 }}>
          <Fade in={!!selectedLocation}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                borderRadius: "16px",
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: "10px",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                }}
              >
                <LocationIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  SELECTED LOCATION
                </Typography>
                <Typography variant="body2" fontWeight="800">
                  {selectedLocation.location} • {selectedLocation.quantity}{" "}
                  {t("inventory.stockUnits")}
                </Typography>
              </Box>
            </Paper>
          </Fade>
        </Box>
      )}
    </>
  );
};

export default AdjustmentQuickInfo;
