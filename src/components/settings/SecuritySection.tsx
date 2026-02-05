import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import SecurityIcon from "@mui/icons-material/Security";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useTranslation } from "@/i18n";

import { useErrorHandler } from "@hooks/useErrorHandler";

interface SecuritySectionProps {
  onSignOut: () => void;
  onChangePassword: (password: string) => Promise<void>;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  onSignOut,
  onChangePassword,
}) => {
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
    setValidationError(null);
    setFormData({ newPassword: "", confirmPassword: "" });
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.newPassword.length < 6) {
      setValidationError(t("security.passwordTooShort"));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError(t("security.passwordsDoNotMatch"));
      return;
    }

    try {
      setLoading(true);
      await onChangePassword(formData.newPassword);
      handleClose();
    } catch (err: unknown) {
      handleError(err, t("security.errorChangingPassword"));
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
          height: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="bold">
            {t("security.title")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleOpen}
            sx={{
              borderColor: "#30363d",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            {t("security.changePassword")}
          </Button>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={onSignOut}
          >
            {t("security.signOut")}
          </Button>
        </Box>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <DialogTitle>{t("security.changePassword")}</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                id="new-password"
                name="newPassword"
                autoFocus
                label={t("security.newPassword")}
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                id="confirm-password"
                name="confirmPassword"
                label={t("security.confirmPassword")}
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
              {validationError && (
                <Typography color="error" variant="body2">
                  {validationError}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={loading}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default SecuritySection;
