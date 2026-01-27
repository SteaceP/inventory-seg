import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { LocationOn as LocationIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";
import type { SelectedLocation } from "./types";

const MotionBox = motion.create(Box);

interface LocationSelectorProps {
  item: InventoryItem;
  onLocationSelect: (location: SelectedLocation) => void;
  containerVariants: Variants;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  item,
  onLocationSelect,
  containerVariants,
}) => {
  const { t } = useTranslation();

  return (
    <MotionBox
      key="selectLocation"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
        {t("inventory.locationRequired")}
      </Typography>
      <List sx={{ p: 0 }}>
        {(item.stock_locations || []).map((loc) => (
          <ListItem key={loc.location} disablePadding sx={{ mb: 1.5 }}>
            <ListItemButton
              onClick={() =>
                onLocationSelect({
                  location: loc.location || "",
                  quantity: loc.quantity || 0,
                  parent_location: loc.parent_location ?? undefined,
                })
              }
              sx={{
                borderRadius: "16px",
                py: 2,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(2, 125, 111, 0.1)"
                      : "rgba(2, 125, 111, 0.05)",
                  transform: "scale(1.02)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    mr: 2,
                  }}
                >
                  <LocationIcon />
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="800">
                      {loc.location}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      {t("inventory.stockLabel").toUpperCase()}: {loc.quantity}
                    </Typography>
                  }
                />
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </MotionBox>
  );
};

export default LocationSelector;
