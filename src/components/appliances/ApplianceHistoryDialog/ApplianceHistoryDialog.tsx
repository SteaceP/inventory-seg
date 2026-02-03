import React from "react";
import { useTranslation } from "@/i18n";
import type { Appliance, Repair } from "@/types/appliances";

import RepairItem from "../shared/RepairItem";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";

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
