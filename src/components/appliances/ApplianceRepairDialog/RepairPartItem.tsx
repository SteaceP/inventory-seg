import React from "react";
import { Box, TextField, IconButton } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useTranslation } from "../../../i18n";
import type { RepairPart } from "../../../types/appliances";

interface RepairPartItemProps {
  part: RepairPart;
  onRemove: () => void;
  onFieldChange: (field: keyof RepairPart, value: string | number) => void;
}

const RepairPartItem: React.FC<RepairPartItemProps> = ({
  part,
  onRemove,
  onFieldChange,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "flex-start" }}>
      <TextField
        size="small"
        label={t("appliances.partName")}
        sx={{ flex: 3 }}
        value={part.name}
        onChange={(e) => onFieldChange("name", e.target.value)}
      />
      <TextField
        size="small"
        label={t("appliances.partPrice")}
        type="number"
        sx={{ flex: 1 }}
        value={part.price || ""}
        onChange={(e) =>
          onFieldChange("price", parseFloat(e.target.value) || 0)
        }
      />
      <IconButton color="error" onClick={onRemove}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default RepairPartItem;
