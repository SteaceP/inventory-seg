import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Alert, Snackbar } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/ThemeContext";

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
    setUserProfile
  } = useThemeContext();

  const [settings, setSettings] = useState({
    displayName: "",
    avatarUrl: "",
    email: "",
    notifications: true,
    emailAlerts: false,
    lowStockThreshold: 5,
    darkMode: darkMode,
    compactView: compactView,
  });

  useEffect(() => {
    // Update local state when context changes (instant feedback)
    setSettings(prev => ({ ...prev, darkMode, compactView }));
  }, [darkMode, compactView]);

  useEffect(() => {
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
          });
          // Sync context
          setUserProfile({
            displayName: userSettings.display_name || "",
            avatarUrl: userSettings.avatar_url || "",
          });
          if (userSettings.dark_mode !== darkMode) toggleDarkMode(userSettings.dark_mode);
          if (userSettings.compact_view !== compactView) toggleCompactView(userSettings.compact_view);
        } else {
          setSettings((prev) => ({
            ...prev,
            email: user.email || "",
          }));
        }
      }
    };
    loadUserData();
  }, []);

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
    } catch (err: any) {
      setError(err.message || "L'upload de l'avatar a échoué.");
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
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;
      setUserProfile({ displayName: settings.displayName });
      setSaveSuccess(true);
    } catch {
      setError("L'enregistrement des paramètres a échoué. Veuillez réessayer.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Paramètres
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gérez vos paramètres de compte et vos préférences
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
          <SecuritySection onSignOut={handleSignOut} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" size="large" onClick={handleSaveSettings} sx={{ px: 4 }}>
          Enregistrer les modifications
        </Button>
      </Box>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Paramètres enregistrés avec succès !
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
