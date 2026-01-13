import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "../../i18n";
import type { Appliance, Repair } from "../../types/appliances";

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
              <Paper
                key={repair.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontWeight="bold">
                    {repair.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {repair.repair_date}
                  </Typography>
                </Box>
                {repair.parts && repair.parts.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      {t("appliances.parts")}:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        pl: 1,
                      }}
                    >
                      {repair.parts.map((part, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            - {part.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {part.price.toFixed(2)} $
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("appliances.serviceProvider")}:{" "}
                    {repair.service_provider || t("appliances.unknown")}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {t("appliances.totalCost")}:{" "}
                    {(repair.parts || [])
                      .reduce((sum, p) => sum + (p.price || 0), 0)
                      .toFixed(2)}{" "}
                    $
                  </Typography>
                </Box>
              </Paper>
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
