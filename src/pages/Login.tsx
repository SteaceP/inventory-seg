import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { useUserContext } from "@contexts/UserContext";
import { supabase } from "@/supabaseClient";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import type { Language } from "@/types/user";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { usePerformance } from "@hooks/usePerformance";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Link from "@mui/material/Link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface LocationState {
  from?: {
    pathname: string;
  };
}

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

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { language, setLanguage } = useUserContext();
  const { handleError } = useErrorHandler();
  const { measureOperation } = usePerformance();
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    undefined
  );
  const turnstileRef = React.useRef<TurnstileInstance>(null);
  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await measureOperation(
        "auth.login",
        "Sign In with Password",
        async () => {
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email,
              password,
              options: {
                // In development, sending undefined allows requests to proceed if the server permits
                captchaToken,
              },
            }
          );

          if (signInError) {
            console.error("[Login] Auth error details:", {
              message: signInError.message,
              status: signInError.status,
              email,
            });
            throw signInError;
          }

          const from = (location.state as LocationState)?.from?.pathname || "/";
          void navigate(from, { replace: true });
        }
      );
    } catch (err: unknown) {
      handleError(err, t("errors.login") || "Login failed", {
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

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
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
                {t("login.signIn")}
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={(e) => {
                void handleLogin(e);
              }}
              sx={{ width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t("login.email")}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("login.password")}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
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
                {loading ? t("login.signingIn") : t("login.signIn")}
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{ mt: 3, mb: 1, color: "text.secondary" }}
            >
              {t("login.noAccount")}{" "}
              <Link
                component={RouterLink}
                to="/signup"
                fontWeight="bold"
                sx={{ cursor: "pointer" }}
              >
                {t("login.noAccountLink")}
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

export default Login;
