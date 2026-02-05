import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Turnstile } from "@marsidev/react-turnstile";
import type { SignupFormProps } from "@/types/auth";

const SignupForm: React.FC<SignupFormProps> = ({
  displayName,
  onDisplayNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  loading,
  captchaToken,
  onCaptchaSuccess,
  onCaptchaError,
  onCaptchaExpire,
  turnstileRef,
  turnstileSiteKey,
  labels,
  isDev,
}) => {
  return (
    <>
      <TextField
        margin="normal"
        required
        fullWidth
        id="displayName"
        label={labels.displayName}
        name="displayName"
        autoComplete="name"
        autoFocus
        value={displayName}
        onChange={(e) => onDisplayNameChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label={labels.email}
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label={labels.password}
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={labels.togglePassword}
                  onClick={onTogglePassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <Turnstile
          key={turnstileSiteKey}
          ref={turnstileRef}
          siteKey={turnstileSiteKey}
          onSuccess={onCaptchaSuccess}
          onError={onCaptchaError}
          onExpire={onCaptchaExpire}
        />
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading || (!captchaToken && !isDev)}
        sx={{
          py: 1.5,
          fontSize: "1rem",
          fontWeight: "bold",
          boxShadow: "0 4px 14px 0 rgba(88, 166, 255, 0.39)",
        }}
      >
        {loading ? labels.creatingAccount : labels.createAccount}
      </Button>
    </>
  );
};

export default SignupForm;
