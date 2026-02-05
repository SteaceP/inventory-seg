import React from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import { useTheme, alpha } from "@mui/material/styles";

import InventoryIcon from "@mui/icons-material/Inventory";

import type { InventoryItem } from "@/types/inventory";

interface InventoryCardMediaProps {
  item: InventoryItem;
  isSelected: boolean;
  onToggle: (id: string, checked: boolean) => void;
  compactView: boolean;
  isBeingEdited: boolean;
  editorNames: string;
  t: (
    key: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ) => string;
}

const InventoryCardMedia: React.FC<InventoryCardMediaProps> = ({
  item,
  isSelected,
  onToggle,
  compactView,
  isBeingEdited,
  editorNames,
  t,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ position: "relative" }}>
      <Checkbox
        checked={isSelected}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(4px)",
          "&:hover": { bgcolor: theme.palette.background.paper },
          borderRadius: 1,
          p: 0.5,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 2,
          display: "flex",
          gap: 1,
        }}
      >
        <Chip
          label={item.category}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.9),
            color: "white",
            fontWeight: "bold",
            backdropFilter: "blur(4px)",
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }}
        />
        {isBeingEdited && (
          <Chip
            label={`${editorNames} ${t("inventory.isEditing") || "is editing..."}`}
            size="small"
            color="warning"
            sx={{
              fontWeight: "bold",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.6 },
                "100%": { opacity: 1 },
              },
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: compactView ? 140 : 180,
          bgcolor: "background.paper",
        }}
      >
        {item.image_url ? (
          <>
            <Box
              component="img"
              src={item.image_url}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "blur(20px) opacity(0.3)",
                transform: "scale(1.1)",
              }}
            />
            <Box
              component="img"
              src={item.image_url}
              className="card-image"
              sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transition: "transform 0.5s ease",
                p: 1,
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.disabled",
              bgcolor: "action.hover",
            }}
          >
            <InventoryIcon sx={{ fontSize: 48, opacity: 0.2 }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InventoryCardMedia;
