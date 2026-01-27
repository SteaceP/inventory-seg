import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Button,
  Alert,
  Snackbar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";
import { useUserContext } from "@contexts/UserContext";
import ProfileSection from "@components/settings/ProfileSection";
import NotificationSection from "@components/settings/NotificationSection";
import AppearanceSection from "@components/settings/AppearanceSection";
import SecuritySection from "@components/settings/SecuritySection";
import type { Language } from "@/types/user";
import {
  validateImageFile,
  generateSecureFileName,
  getExtensionFromMimeType,
} from "@utils/crypto";

const Settings: React.FC = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    displayName,
    avatarUrl,
    language,
    setLanguage,
    setUserProfile,
    darkMode,
    compactView,
  } = useUserContext();

  const { t } = useTranslation();

  const [settings, setSettings] = useState({
    displayName: displayName,
    avatarUrl: avatarUrl,
    email: "",
    emailAlerts: false,
    lowStockThreshold: 5,
    darkMode: darkMode,
    compactView: compactView,
    language: language,
    pushEnabled: false,
    userId: null as string | null,
  });

  useEffect(() => {
    // Sync local state when context values are loaded/changed
    setSettings((prev) => ({
      ...prev,
      displayName: displayName || prev.displayName,
      avatarUrl: avatarUrl || prev.avatarUrl,
      darkMode,
      compactView,
      language,
    }));
  }, [displayName, avatarUrl, darkMode, compactView, language]);

  useEffect(() => {
    // Update local state when context changes (instant feedback)
    setSettings((prev) => ({ ...prev, darkMode, compactView }));
  }, [darkMode, compactView]);

  const languageChangeRef = useRef(false);

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setSettings((prev) => ({
          ...prev,
          email: user.email || "",
          userId: user.id,
        }));

        const { data: userSettings } = await supabase
          .from("user_settings")
          .select("email_alerts, low_stock_threshold")
          .eq("user_id", user.id)
          .single();

        if (userSettings) {
          const settingsObj = userSettings as {
            email_alerts: boolean | null;
            low_stock_threshold: number | null;
          };
          setSettings((prev) => ({
            ...prev,
            emailAlerts: settingsObj.email_alerts ?? false,
            lowStockThreshold: settingsObj.low_stock_threshold ?? 5,
          }));
        }
      }
    };
    void loadUserData();
  }, []);

  const handleAvatarUpload = async (file: File) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Validate file type and size
      validateImageFile(file);

      // Get proper extension from MIME type
      const ext = getExtensionFromMimeType(file.type);
      const fileName = generateSecureFileName(ext);
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setSettings({ ...settings, avatarUrl: publicUrl });
      setUserProfile({ avatarUrl: publicUrl });

      // Update database immediately for avatar
      const { error: dbError } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          avatar_url: publicUrl,
        },
        { onConflict: "user_id" }
      );

      if (dbError) throw dbError;
      setSaveSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t("settings.avatarUploadError"));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          display_name: settings.displayName,
          email_alerts: settings.emailAlerts,
          low_stock_threshold: settings.lowStockThreshold,
          dark_mode: settings.darkMode,
          compact_view: settings.compactView,
          avatar_url: settings.avatarUrl,
          language: settings.language,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;
      setUserProfile({ displayName: settings.displayName });
      setSaveSuccess(true);
    } catch {
      setError(t("settings.saveError"));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t("settings.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("settings.description")}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileSection
            displayName={settings.displayName}
            avatarUrl={settings.avatarUrl}
            email={settings.email}
            onDisplayNameChange={(name) =>
              setSettings({ ...settings, displayName: name })
            }
            onAvatarChange={(file) => void handleAvatarUpload(file)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NotificationSection />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AppearanceSection
            darkMode={settings.darkMode}
            compactView={settings.compactView}
            onDarkModeChange={(enabled) =>
              setSettings({ ...settings, darkMode: enabled })
            }
            onCompactViewChange={(enabled) =>
              setSettings({ ...settings, compactView: enabled })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 3,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(22, 27, 34, 0.7)"
                  : "#ffffff",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              {t("settings.language")}
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">
                {t("settings.language")}
              </InputLabel>
              <Select
                labelId="language-select-label"
                value={settings.language}
                label={t("settings.language")}
                onChange={(e) => {
                  const val = (e.target as { value: Language }).value;
                  // mark that the language change originated from the UI so the
                  // settings loader won't immediately overwrite it from the DB
                  languageChangeRef.current = true;
                  setSettings({ ...settings, language: val });
                  void setLanguage(val);
                }}
              >
                <MenuItem value={"fr"}>{t("lang.fr")}</MenuItem>
                <MenuItem value={"en"}>{t("lang.en")}</MenuItem>
                <MenuItem value={"ar"}>{t("lang.ar")}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SecuritySection
            onSignOut={() => void handleSignOut()}
            onChangePassword={async (newPassword) => {
              const { error } = await supabase.auth.updateUser({
                password: newPassword,
              });
              if (error) throw error;
              setSaveSuccess(true);
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => void handleSaveSettings()}
          sx={{ px: 4 }}
        >
          {t("settings.save")}
        </Button>
      </Box>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {t("settings.saved")}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setError(null)}
        >
          {error || t("settings.saveError")}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
