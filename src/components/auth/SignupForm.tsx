import React from "react";

import { Turnstile } from "@marsidev/react-turnstile";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import type { TurnstileInstance } from "@marsidev/react-turnstile";

/**
 * Props for the signup credentials form.
 */
interface SignupFormProps {
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  /** Toggle visibility of password characters */
  showPassword: boolean;
  onTogglePassword: () => void;
  /** Form submission state */
  loading: boolean;
  /** Cloudflare Turnstile token */
  captchaToken: string | undefined;
  onCaptchaSuccess: (token: string) => void;
  onCaptchaError: () => void;
  onCaptchaExpire: () => void;
  /** Ref to Turnstile instance for resetting */
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  turnstileSiteKey: string;
  /** Localized text for form elements */
  labels: {
    displayName: string;
    email: string;
    password: string;
    togglePassword: string;
    createAccount: string;
    creatingAccount: string;
    captchaError: string;
  };
  /** Development mode flag for skipping captcha */
  isDev: boolean;
  /** Callback for form submission */
  onSubmit?: (e: React.SyntheticEvent<HTMLFormElement>) => void | Promise<void>;
}

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
  onSubmit,
}) => {
  return (
    <Box
      component="form"
      onSubmit={(e) => {
        if (onSubmit) {
          void onSubmit(e);
        }
      }}
      sx={{ width: "100%" }}
    >
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
    </Box>
  );
};

export default SignupForm;
