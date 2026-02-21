import React, { useState } from "react";

import { type TurnstileInstance } from "@marsidev/react-turnstile";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";

import LanguageSwitcher from "@/components/auth/LanguageSwitcher";
import LoginHeader from "@/components/auth/LoginHeader";
import SignupFooter from "@/components/auth/SignupFooter";
import SignupForm from "@/components/auth/SignupForm";
import SignupSuccess from "@/components/auth/SignupSuccess";
import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";

import { useUserContext } from "@contexts/UserContextDefinition";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { usePerformance } from "@hooks/usePerformance";

// Cloudflare Turnstile Site Key
// In development, we use the "Always Pass" test key if the environment variable is missing
const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

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
    if (!email.toLowerCase().trim().endsWith("@s-e-g.ca")) {
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
      <SignupSuccess
        title={t("signup.title")}
        successMessage={t("signup.success")}
        signInLabel={t("login.signIn")}
        onSignInClick={() => {
          void navigate("/login");
        }}
      />
    );
  }

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
            <LoginHeader title={t("signup.title")} />

            <Box sx={{ width: "100%" }}>
              <SignupForm
                displayName={displayName}
                onDisplayNameChange={setDisplayName}
                email={email}
                onEmailChange={setEmail}
                password={password}
                onPasswordChange={setPassword}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                loading={loading}
                captchaToken={captchaToken}
                onCaptchaSuccess={setCaptchaToken}
                onCaptchaError={() => {
                  setCaptchaToken(undefined);
                  handleError(
                    new Error("CAPTCHA Error"),
                    t("common.captchaError") || "CAPTCHA failed"
                  );
                }}
                onCaptchaExpire={() => setCaptchaToken(undefined)}
                turnstileRef={turnstileRef}
                turnstileSiteKey={TURNSTILE_SITE_KEY}
                labels={{
                  displayName: t("signup.displayName"),
                  email: t("signup.email"),
                  password: t("signup.password"),
                  togglePassword: t("common.togglePassword"),
                  createAccount: t("signup.createAccount"),
                  creatingAccount: t("signup.creatingAccount"),
                  captchaError: t("common.captchaError") || "CAPTCHA failed",
                }}
                isDev={import.meta.env.DEV}
                onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
                  void handleSignup(e);
                }}
              />
            </Box>

            <SignupFooter
              alreadyHaveAccountText={t("signup.alreadyHaveAccount")}
              signInText={t("login.signIn")}
            />

            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
            />
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Signup;
