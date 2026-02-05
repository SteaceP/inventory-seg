import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";

interface ApplianceActionButtonsProps {
  appliance: Appliance;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
}

const ApplianceActionButtons: React.FC<ApplianceActionButtonsProps> = ({
  appliance,
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
        onClick={() => onEdit(appliance)}
      >
        {t("appliances.edit")}
      </Button>
      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => {
          if (appliance.id) onDelete(appliance.id);
        }}
      >
        {t("appliances.delete")}
      </Button>
    </Box>
  );
};

export default ApplianceActionButtons;
