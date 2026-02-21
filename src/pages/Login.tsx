import React, { useState } from "react";

import { type TurnstileInstance } from "@marsidev/react-turnstile";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";

import LanguageSwitcher from "@/components/auth/LanguageSwitcher";
import LoginFooter from "@/components/auth/LoginFooter";
import LoginForm from "@/components/auth/LoginForm";
import LoginHeader from "@/components/auth/LoginHeader";
import TwoFactorVerification from "@/components/auth/TwoFactorVerification";
import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";

import { useUserContext } from "@contexts/UserContextDefinition";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { usePerformance } from "@hooks/usePerformance";
import { logInfo } from "@utils/errorReporting";

import type { AuthMFAChallengeResponse } from "@supabase/supabase-js";

interface LocationState {
  from?: {
    pathname: string;
  };
}

// Cloudflare Turnstile Site Key
// In development, we use the "Always Pass" test key if the environment variable is missing
const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
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
    setMfaError(null);

    try {
      await measureOperation(
        "auth.login",
        "Sign In with Password",
        async () => {
          let isMfaRequired = false;
          const { data, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
              options: {
                // In development, sending undefined allows requests to proceed if the server permits
                captchaToken,
              },
            });

          if (signInError) {
            // Check if MFA is required
            if (signInError.message === "MFA challenge required") {
              // Get MFA factors
              const { data: factorsData, error: factorsError } =
                await supabase.auth.mfa.listFactors();

              if (factorsError) {
                throw factorsError;
              }

              if (factorsData?.totp && factorsData.totp.length > 0) {
                const factor = factorsData.totp[0];
                const challengeResponse: AuthMFAChallengeResponse =
                  await supabase.auth.mfa.challenge({
                    factorId: factor.id,
                  });
                if (challengeResponse.data) {
                  setMfaChallengeId(challengeResponse.data.id);
                  setMfaFactorId(factor.id);
                  setMfaRequired(true);
                  isMfaRequired = true;
                  setLoading(false);
                  return;
                }
              } else {
                // MFA is required but no factors found, this is an inconsistent state
                logInfo(
                  "[Login] MFA required but no enrollment factors found",
                  {
                    email,
                  }
                );
                throw new Error(
                  t("errors.mfaEnrollmentRequired") ||
                    "MFA required but no enrollment factors found. Please contact support."
                );
              }
            }
            throw signInError;
          }

          // Check if MFA is required by looking at assurance levels
          const { data: aalData, error: aalError } =
            await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

          if (aalError) {
            throw aalError;
          }

          if (
            aalData?.nextLevel === "aal2" &&
            aalData.nextLevel !== aalData.currentLevel
          ) {
            // User has MFA enrolled but is only at AAL1
            const { data: factorsData, error: factorsError } =
              await supabase.auth.mfa.listFactors();

            if (factorsError) {
              throw factorsError;
            }

            const totpFactor = factorsData?.totp?.[0];
            if (totpFactor) {
              const { data: challengeData, error: challengeError } =
                await supabase.auth.mfa.challenge({
                  factorId: totpFactor.id,
                });

              if (challengeError) {
                throw challengeError;
              }

              if (challengeData) {
                setMfaChallengeId(challengeData.id);
                setMfaFactorId(totpFactor.id);
                setMfaRequired(true);
                isMfaRequired = true;
                setLoading(false);
                return;
              }
            } else {
              // AAL2 achievable but no factors found
              logInfo("[Login] AAL2 achievable but no factors found", {
                email,
              });
              throw new Error(
                t("errors.mfaFactorsMissing") ||
                  "MFA is required but no enrollment factors were found."
              );
            }
          }

          // If no MFA required, navigate to app
          if (!isMfaRequired && data?.session) {
            const from =
              (location.state as LocationState)?.from?.pathname || "/";
            void navigate(from, { replace: true });
          }
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
      // Need a way to check if MFA was triggered within this scope
      // Using mfaRequired state might be stale due to setMfaRequired being async
      // but the local isMfaRequired handles it for the current execution.
      // However, finally runs after the measureOperation.
      setLoading(false);
    }
  };

  const handleMfaVerify = async (code: string) => {
    if (!mfaChallengeId || !mfaFactorId) return;

    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code,
      });

      if (error) {
        setMfaError(t("mfa.codeInvalid") || "Invalid verification code");
        throw error;
      }

      if (data) {
        const from = (location.state as LocationState)?.from?.pathname || "/";
        void navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      // Error already set in state for UI feedback
      console.error("MFA verification error:", err);
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
            <LoginHeader title={t("login.signIn")} />

            <Box sx={{ width: "100%" }}>
              {mfaRequired ? (
                <TwoFactorVerification
                  onVerify={async (code: string) => {
                    await handleMfaVerify(code);
                  }}
                  loading={loading}
                  error={mfaError}
                />
              ) : (
                <LoginForm
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
                    email: t("login.email"),
                    password: t("login.password"),
                    togglePassword: t("common.togglePassword"),
                    signIn: t("login.signIn"),
                    signingIn: t("login.signingIn"),
                    captchaError: t("common.captchaError"),
                  }}
                  isDev={import.meta.env.DEV}
                  onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
                    void handleLogin(e);
                  }}
                />
              )}
            </Box>

            {!mfaRequired && (
              <LoginFooter
                noAccountText={t("login.noAccount")}
                noAccountLinkText={t("login.noAccountLink")}
              />
            )}

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

export default Login;
