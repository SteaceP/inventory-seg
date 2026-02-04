import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "@/i18n";
import { useUserContext } from "@contexts/UserContext";
import { supabase } from "@/supabaseClient";
import { useErrorHandler } from "@hooks/useErrorHandler";
import TwoFactorEnrollment from "./TwoFactorEnrollment";

const TwoFactorSettings: React.FC = () => {
  const { t } = useTranslation();
  const { mfaEnabled, setMfaEnabled, userId } = useUserContext();
  const { handleError } = useErrorHandler();
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEnableClick = () => {
    setEnrollmentOpen(true);
  };

  const handleEnrollmentSuccess = async () => {
    await setMfaEnabled(true);
    setEnrollmentOpen(false);
  };

  const handleDisableClick = () => {
    setDisableDialogOpen(true);
  };

  const handleConfirmDisable = async () => {
    setLoading(true);
    try {
      // Get all factors for the user
      const { data: factors, error: listError } =
        await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      // Unenroll from all factors
      if (factors?.totp && factors.totp.length > 0) {
        for (const factor of factors.totp) {
          const { error: unenrollError } = await supabase.auth.mfa.unenroll({
            factorId: factor.id,
          });
          if (unenrollError) throw unenrollError;
        }
      }

      // Update user settings
      if (userId) {
        const { error: updateError } = await supabase
          .from("user_settings")
          .update({ mfa_enabled: false })
          .eq("user_id", userId);

        if (updateError) throw updateError;
      }

      await setMfaEnabled(false);
      setDisableDialogOpen(false);
    } catch (err: unknown) {
      handleError(err, t("mfa.disableError") || "Failed to disable MFA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        sx={{
          p: 3,
          background: (theme) =>
            theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
          backdropFilter: "blur(10px)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="bold">
            {t("mfa.title")}
          </Typography>
          {mfaEnabled && (
            <Chip
              icon={<CheckCircleIcon />}
              label={t("mfa.enabled")}
              color="success"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("mfa.description")}
        </Typography>

        {mfaEnabled ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t("mfa.currentlyEnabled")}
            </Alert>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDisableClick}
              disabled={loading}
            >
              {t("mfa.disable")}
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={handleEnableClick}
            startIcon={<SecurityIcon />}
          >
            {t("mfa.enable")}
          </Button>
        )}
      </Paper>

      <TwoFactorEnrollment
        open={enrollmentOpen}
        onClose={() => setEnrollmentOpen(false)}
        onSuccess={() => void handleEnrollmentSuccess()}
      />

      <Dialog
        open={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
      >
        <DialogTitle>{t("mfa.confirmDisable")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("mfa.disableWarning")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDisableDialogOpen(false)}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => void handleConfirmDisable()}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {t("mfa.disable")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TwoFactorSettings;
