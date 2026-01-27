import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "../../../i18n";
import type { Appliance, Repair } from "../../../types/appliances";

import RepairItem from "../shared/RepairItem";

interface ApplianceHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  appliance: Appliance | null;
  repairs: Repair[];
  loading: boolean;
}

const ApplianceHistoryDialog: React.FC<ApplianceHistoryDialogProps> = ({
  open,
  onClose,
  appliance,
  repairs,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{`${t("appliances.history")}: ${appliance?.name || ""}`}</DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 } }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : repairs.length === 0 ? (
          <Typography color="text.secondary">
            {t("appliances.noRepairs")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {repairs.map((repair) => (
              <RepairItem key={repair.id} repair={repair} />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("appliances.close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplianceHistoryDialog;
