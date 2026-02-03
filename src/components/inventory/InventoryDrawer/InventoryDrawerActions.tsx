import React from "react";
import { useTranslation } from "@/i18n";
import type { InventoryItem } from "@/types/inventory";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
