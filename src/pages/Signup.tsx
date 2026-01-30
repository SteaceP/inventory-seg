import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  IconButton,
  InputAdornment,
  Link,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { useUserContext } from "@contexts/UserContext";
import { supabase } from "@/supabaseClient";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import type { Language } from "@/types/user";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { usePerformance } from "@hooks/usePerformance";

// Cloudflare Turnstile Site Key
// In development, we use the "Always Pass" test key if the environment variable is missing
const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) ||
  "1x00000000000000000000AA";

if (!TURNSTILE_SITE_KEY) {
  console.warn(
    "[Turnstile] Warning: VITE_TURNSTILE_SITE_KEY is not defined. Falling back to test key."
  );
}

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, setLanguage } = useUserContext();
  const { handleError } = useErrorHandler();
  const { measureOperation } = usePerformance();
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    undefined
  );
  const turnstileRef = React.useRef<TurnstileInstance>(null);
  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Domain validation
    if (!email.toLowerCase().endsWith("@s-e-g.ca")) {
      handleError(new Error("Invalid domain"), t("signup.invalidDomain"), {
        email,
      });
      setLoading(false);
      return;
    }

    try {
      await measureOperation(
        "auth.signup",
        "Sign Up with Password",
        async () => {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              // In development, sending undefined allows requests to proceed if the server permits
              captchaToken,
              data: {
                display_name: displayName,
                lang: localStorage.getItem("language") || "en",
              },
            },
          });

          if (signUpError) {
            console.error("[Signup] Auth error details:", {
              message: signUpError.message,
              status: signUpError.status,
              email,
            });
            throw signUpError;
          }

          setSuccess(true);
        }
      );
    } catch (err: unknown) {
      handleError(err, t("errors.signup") || "Sign up failed", {
        email,
        hasCaptcha: !!captchaToken,
        isDev: import.meta.env.DEV,
      });
      turnstileRef.current?.reset();
      setCaptchaToken(undefined);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="xs">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(22, 27, 34, 0.7)"
                  : "#ffffff",
              backdropFilter: "blur(20px)",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t("signup.title")}
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              {t("signup.success")}
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                void navigate("/login");
              }}
            >
              {t("login.signIn")}
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%" }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(22, 27, 34, 0.7)"
                  : "#ffffff",
              backdropFilter: "blur(20px)",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "16px",
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src="/logo-secondary.svg"
                sx={{ width: 120, height: "auto", mb: 2 }}
                alt="Logo"
              />
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                {t("signup.title")}
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={(e) => {
                void handleSignup(e);
              }}
              sx={{ width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="displayName"
                label={t("signup.displayName")}
                name="displayName"
                autoComplete="name"
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t("signup.email")}
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("signup.password")}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="basculer la visibilité du mot de passe"
                          onClick={() => setShowPassword(!showPassword)}
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
                  key={TURNSTILE_SITE_KEY}
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onError={() => {
                    setCaptchaToken(undefined);
                    handleError(
                      new Error("CAPTCHA Error"),
                      t("common.captchaError") || "CAPTCHA failed"
                    );
                  }}
                  onExpire={() => setCaptchaToken(undefined)}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || (!captchaToken && !import.meta.env.DEV)}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  boxShadow: "0 4px 14px 0 rgba(88, 166, 255, 0.39)",
                }}
              >
                {loading
                  ? t("signup.creatingAccount")
                  : t("signup.createAccount")}
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{ mt: 3, mb: 1, color: "text.secondary" }}
            >
              {t("signup.alreadyHaveAccount")}{" "}
              <Link component={RouterLink} to="/login" fontWeight="bold">
                {t("login.signIn")}
              </Link>
            </Typography>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <ToggleButtonGroup
                value={language}
                exclusive
                onChange={(_e, val: string | null) => {
                  if (val) void setLanguage(val as Language);
                }}
                size="small"
                aria-label="language switcher"
                sx={{
                  "& .MuiToggleButton-root": {
                    px: 2,
                    py: 0.5,
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    borderColor: "divider",
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="fr">FR</ToggleButton>
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="ar">AR</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Signup;
