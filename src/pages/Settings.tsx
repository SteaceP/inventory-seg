import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Avatar,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { supabase } from "../supabaseClient";

const Settings: React.FC = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    displayName: "",
    email: "",
    notifications: true,
    emailAlerts: false,
    lowStockThreshold: 5,
    darkMode: true,
    compactView: false,
  });

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Load settings from database
        const { data: userSettings } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (userSettings) {
          setSettings({
            displayName: userSettings.display_name || "",
            email: user.email || "",
            notifications: userSettings.notifications ?? true,
            emailAlerts: userSettings.email_alerts ?? false,
            lowStockThreshold: userSettings.low_stock_threshold ?? 5,
            darkMode: userSettings.dark_mode ?? true,
            compactView: userSettings.compact_view ?? false,
          });
        } else {
          // If no settings exist, just set the email
          setSettings((prev) => ({
            ...prev,
            email: user.email || "",
          }));
        }
      }
    };
    loadUserData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Save settings to database using upsert
      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          display_name: settings.displayName,
          notifications: settings.notifications,
          email_alerts: settings.emailAlerts,
          low_stock_threshold: settings.lowStockThreshold,
          dark_mode: settings.darkMode,
          compact_view: settings.compactView,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      setSaveSuccess(true);
    } catch {
      setError("Failed to save settings. Please try again.");
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "U";
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account settings and preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: "rgba(22, 27, 34, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid #30363d",
              borderRadius: "12px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" fontWeight="bold">
                Profile
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    fontSize: "1.5rem",
                  }}
                >
                  {getInitials(settings.displayName, settings.email)}
                </Avatar>
              </Box>

              <TextField
                label="Display Name"
                fullWidth
                value={settings.displayName}
                onChange={(e) =>
                  setSettings({ ...settings, displayName: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "#30363d" },
                  },
                }}
                InputLabelProps={{ sx: { color: "text.secondary" } }}
              />

              <TextField
                label="Email"
                fullWidth
                value={settings.email}
                disabled
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "#30363d" },
                  },
                }}
                InputLabelProps={{ sx: { color: "text.secondary" } }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: "rgba(22, 27, 34, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid #30363d",
              borderRadius: "12px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <NotificationsIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" fontWeight="bold">
                Notifications
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Enable Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailAlerts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailAlerts: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Email Alerts for Low Stock"
              />
              {settings.emailAlerts && (
                <TextField
                  label="Low Stock Threshold"
                  type="number"
                  fullWidth
                  value={settings.lowStockThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      lowStockThreshold: parseInt(e.target.value) || 0,
                    })
                  }
                  sx={{
                    mt: 2,
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": { borderColor: "#30363d" },
                    },
                  }}
                  InputLabelProps={{ sx: { color: "text.secondary" } }}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: "rgba(22, 27, 34, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid #30363d",
              borderRadius: "12px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <PaletteIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" fontWeight="bold">
                Appearance
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={(e) =>
                      setSettings({ ...settings, darkMode: e.target.checked })
                    }
                    color="primary"
                  />
                }
                label="Dark Mode"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.compactView}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        compactView: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Compact View"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: "rgba(22, 27, 34, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid #30363d",
              borderRadius: "12px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" fontWeight="bold">
                Security
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: "#30363d",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                Change Password
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
              >
                Sign Out
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSaveSettings}
          sx={{ px: 4 }}
        >
          Save Changes
        </Button>
      </Box>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Settings saved successfully!
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
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
