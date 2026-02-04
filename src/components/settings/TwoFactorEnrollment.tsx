import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";
import {
  generateQRCode,
  formatTOTPSecret,
  isValidTOTPCode,
} from "@utils/mfaUtils";
import { useErrorHandler } from "@hooks/useErrorHandler";

interface TwoFactorEnrollmentProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFactorEnrollment: React.FC<TwoFactorEnrollmentProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const steps = [t("mfa.scanQRCode"), t("mfa.verifySetup")];

  const enrollMFA = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (enrollError) throw enrollError;

      if (data) {
        setFactorId(data.id);
        setSecret(data.totp.secret);

        // Generate QR code from the URI
        const qrUrl = await generateQRCode(data.totp.uri);
        setQrCodeUrl(qrUrl);
        setActiveStep(1);
      }
    } catch (err: unknown) {
      handleError(err, t("mfa.enrollmentError") || "Failed to enroll in MFA");
      setError(t("mfa.enrollmentError") || "Failed to start enrollment");
    } finally {
      setLoading(false);
    }
  }, [t, handleError]);

  useEffect(() => {
    if (open && activeStep === 0) {
      void enrollMFA();
    }
  }, [open, activeStep, enrollMFA]);

  const handleVerifyEnrollment = async () => {
    if (!isValidTOTPCode(verifyCode)) {
      setError(t("mfa.codeInvalid") || "Invalid code format");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      // Update user settings to reflect MFA is enabled
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from("user_settings")
          .update({ mfa_enabled: true })
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      }

      onSuccess();
      handleClose();
    } catch (err: unknown) {
      handleError(err, t("mfa.verificationError") || "Verification failed");
      setError(t("mfa.codeInvalid") || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setQrCodeUrl("");
    setSecret("");
    setFactorId("");
    setVerifyCode("");
    setError(null);
    onClose();
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerifyCode(value);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("mfa.enrollmentTitle")}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading && activeStep === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && activeStep === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("mfa.scanWithApp")}
            </Typography>

            {qrCodeUrl && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                  p: 2,
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                }}
              >
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("mfa.manualEntry")}
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: "action.hover",
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.9rem",
                textAlign: "center",
                mb: 3,
              }}
            >
              {formatTOTPSecret(secret)}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              autoFocus
              label={t("mfa.verificationCode")}
              value={verifyCode}
              onChange={handleCodeChange}
              placeholder="000000"
              helperText={t("mfa.enterCodeToVerify")}
              inputProps={{
                maxLength: 6,
                pattern: "[0-9]*",
                inputMode: "numeric",
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.5em",
                },
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t("common.cancel")}
        </Button>
        {activeStep === 1 && (
          <Button
            onClick={() => void handleVerifyEnrollment()}
            variant="contained"
            disabled={!isValidTOTPCode(verifyCode) || loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t("mfa.verify")
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TwoFactorEnrollment;
