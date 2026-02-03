import React from "react";
import { useTranslation } from "@/i18n";
import type { Appliance } from "@/types/appliances";

import Box from "@mui/material/Box";
import { useTheme, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import HistoryIcon from "@mui/icons-material/History";
import BuildIcon from "@mui/icons-material/Build";
import DeleteIcon from "@mui/icons-material/Delete";

interface ApplianceCardActionsProps {
  appliance: Appliance;
  onViewRepairs: (appliance: Appliance) => void;
  onAddRepair: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
}

const ApplianceCardActions: React.FC<ApplianceCardActionsProps> = ({
  appliance,
  onViewRepairs,
  onAddRepair,
  onDelete,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <CardActions
      sx={{
        p: 1.5,
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.default, 0.8)
            : alpha(theme.palette.action.hover, 0.9),
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Button
        size="small"
        startIcon={<HistoryIcon />}
        onClick={() => onViewRepairs(appliance)}
        sx={{
          fontWeight: "bold",
          color: theme.palette.text.primary,
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
      >
        {t("appliances.history")}
      </Button>
      <Box sx={{ flexGrow: 1 }} />
      <IconButton
        size="small"
        color="primary"
        onClick={() => onAddRepair(appliance)}
        aria-label={t("appliances.addRepair")}
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
        }}
      >
        <BuildIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={() => onDelete(appliance.id)}
        aria-label={t("appliances.delete")}
        sx={{
          bgcolor: alpha(theme.palette.error.main, 0.05),
          "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.15) },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </CardActions>
  );
};

export default ApplianceCardActions;
