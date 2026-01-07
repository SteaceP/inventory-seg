import React, { useState, useEffect, useRef } from "react";
import { Typography, Box, Button, Alert, Snackbar, Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTranslation } from "../i18n";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/useThemeContext";

// Sub-components
import ProfileSection from "../components/settings/ProfileSection";
import NotificationSection from "../components/settings/NotificationSection";
import AppearanceSection from "../components/settings/AppearanceSection";
import SecuritySection from "../components/settings/SecuritySection";

const Settings: React.FC = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    darkMode,
    compactView,
    toggleDarkMode,
    toggleCompactView,
    setUserProfile,
    language,
    setLanguage
  } = useThemeContext();

  const { t } = useTranslation();

  const [settings, setSettings] = useState({
    displayName: "",
    avatarUrl: "",
    email: "",
    notifications: true,
    emailAlerts: false,
    lowStockThreshold: 5,
    darkMode: darkMode,
    compactView: compactView,
    language: language,
  });

  useEffect(() => {
    // Update local state when context changes (instant feedback)
    setSettings(prev => ({ ...prev, darkMode, compactView }));
  }, [darkMode, compactView]);

  const languageChangeRef = useRef(false);

  useEffect(() => {
    if (languageChangeRef.current) {
      // Skip this load if the language was just changed by the user to avoid
      // briefly reverting to the DB value while the new preference persists.
      languageChangeRef.current = false;
      return;
    }
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userSettings } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (userSettings) {
          setSettings({
            displayName: userSettings.display_name || "",
            avatarUrl: userSettings.avatar_url || "",
            email: user.email || "",
            notifications: userSettings.notifications ?? true,
            emailAlerts: userSettings.email_alerts ?? false,
            lowStockThreshold: userSettings.low_stock_threshold ?? 5,
            darkMode: userSettings.dark_mode ?? true,
            compactView: userSettings.compact_view ?? false,
            language: (userSettings.language as 'fr' | 'en' | 'ar') || 'fr',
          });
          // Sync context
          setUserProfile({
            displayName: userSettings.display_name || "",
            avatarUrl: userSettings.avatar_url || "",
          });
          if (userSettings.dark_mode !== darkMode) toggleDarkMode(userSettings.dark_mode);
          if (userSettings.compact_view !== compactView) toggleCompactView(userSettings.compact_view);
          if ((userSettings.language as 'fr' | 'en' | 'ar') !== language) setLanguage((userSettings.language as 'fr' | 'en' | 'ar') || 'fr');
        } else {
          setSettings((prev) => ({
            ...prev,
            email: user.email || "",
          }));
        }
      }
    };
    loadUserData();
  }, [darkMode, compactView, language, setUserProfile, toggleDarkMode, toggleCompactView, setLanguage]);

  const handleAvatarUpload = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setSettings({ ...settings, avatarUrl: publicUrl });
      setUserProfile({ avatarUrl: publicUrl });

      // Update database immediately for avatar
      const { error: dbError } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        avatar_url: publicUrl,
      }, { onConflict: "user_id" });

      if (dbError) throw dbError;
      setSaveSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t('settings.avatarUploadError'));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          display_name: settings.displayName,
          notifications: settings.notifications,
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
      setError(t('settings.saveError'));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('settings.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('settings.description')}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileSection
            displayName={settings.displayName}
            avatarUrl={settings.avatarUrl}
            email={settings.email}
            onDisplayNameChange={(name) => setSettings({ ...settings, displayName: name })}
            onAvatarChange={handleAvatarUpload}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NotificationSection
            notifications={settings.notifications}
            emailAlerts={settings.emailAlerts}
            lowStockThreshold={settings.lowStockThreshold}
            onNotificationsChange={(enabled) => setSettings({ ...settings, notifications: enabled })}
            onEmailAlertsChange={(enabled) => setSettings({ ...settings, emailAlerts: enabled })}
            onThresholdChange={(val) => setSettings({ ...settings, lowStockThreshold: val })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AppearanceSection
            darkMode={settings.darkMode}
            compactView={settings.compactView}
            onDarkModeChange={(enabled) => setSettings({ ...settings, darkMode: enabled })}
            onCompactViewChange={(enabled) => setSettings({ ...settings, compactView: enabled })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 3, background: (theme) => theme.palette.mode === 'dark' ? 'rgba(22, 27, 34, 0.7)' : '#ffffff', border: '1px solid', borderColor: 'divider', borderRadius: '12px', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>{t('settings.language')}</Typography>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">{t('settings.language')}</InputLabel>
              <Select
                labelId="language-select-label"
                value={settings.language}
                label={t('settings.language')}
                onChange={(e) => {
                  const val = e.target.value as 'fr' | 'en' | 'ar';
                  // mark that the language change originated from the UI so the
                  // settings loader won't immediately overwrite it from the DB
                  languageChangeRef.current = true;
                  setSettings({ ...settings, language: val });
                  setLanguage(val);
                }}
              >
                <MenuItem value={'fr'}>{t('lang.fr')}</MenuItem>
                <MenuItem value={'en'}>{t('lang.en')}</MenuItem>
                <MenuItem value={'ar'}>{t('lang.ar')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SecuritySection onSignOut={handleSignOut} />
        </Grid>
      </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" size="large" onClick={handleSaveSettings} sx={{ px: 4 }}>
          {t('settings.save')}
        </Button>
      </Box>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {t('settings.saved')}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }} onClose={() => setError(null)}>
          {error || t('settings.saveError')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
