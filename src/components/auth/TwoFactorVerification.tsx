import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { useTranslation } from "@/i18n";
import { isValidTOTPCode } from "@utils/mfaUtils";

interface TwoFactorVerificationProps {
  onVerify: (code: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onVerify,
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer for code validity countdown (30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = 30 - (now % 30);
        return remaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidTOTPCode(code)) {
      await onVerify(code);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  const progress = (timeLeft / 30) * 100;

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      sx={{ width: "100%" }}
    >
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        {t("mfa.required")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("mfa.enterCode")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        autoFocus
        label={t("mfa.verificationCode")}
        value={code}
        onChange={handleCodeChange}
        placeholder="000000"
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
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("mfa.codeExpires")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="bold"
          >
            {timeLeft}s
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: "divider",
            "& .MuiLinearProgress-bar": {
              backgroundColor: timeLeft < 10 ? "error.main" : "primary.main",
            },
          }}
        />
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={!isValidTOTPCode(code) || loading}
        sx={{
          py: 1.5,
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          t("mfa.verify")
        )}
      </Button>
    </Box>
  );
};

export default TwoFactorVerification;
