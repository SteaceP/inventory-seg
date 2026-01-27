import React from "react";
import { Box, Button } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useTranslation } from "../../../i18n";
import type { InventoryItem } from "../../../types/inventory";

interface InventoryDrawerActionsProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const InventoryDrawerActions: React.FC<InventoryDrawerActionsProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        p: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        gap: 2,
      }}
    >
      <Button
        fullWidth
        variant="outlined"
        color="primary"
        startIcon={<EditIcon />}
        onClick={() => onEdit(item)}
      >
        {t("inventory.edit")}
      </Button>
      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => {
          if (item.id) onDelete(item.id);
        }}
      >
        {t("inventory.delete")}
      </Button>
    </Box>
  );
};

export default InventoryDrawerActions;
