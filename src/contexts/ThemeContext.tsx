import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "./theme-context";
import { useAlert } from "./useAlertContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showError } = useAlert();
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchThemeSettings = useCallback(async (uid: string) => {
    try {
      const { data: settings, error } = await supabase
        .from("user_settings")
        .select("dark_mode, compact_view")
        .eq("user_id", uid)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (settings) {
        setDarkMode(settings.dark_mode ?? true);
        setCompactView(settings.compact_view ?? false);
      }
    } catch (err: unknown) {
      showError("Failed to fetch theme settings: " + (err as Error).message);
    }
  }, [showError]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SETTINGS_FETCH_ERROR") {
        showError(event.data.message);
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [showError]);

  useEffect(() => {
    const initTheme = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserId(session.user.id);
        await fetchThemeSettings(session.user.id);
      }
    };

    initTheme();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user) {
        fetchThemeSettings(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchThemeSettings]);

  const toggleDarkMode = async (enabled: boolean) => {
    setDarkMode(enabled);
    if (userId) {
      try {
        const { error } = await supabase
          .from("user_settings")
          .upsert(
            { user_id: userId, dark_mode: enabled },
            { onConflict: "user_id" }
          );
        if (error) throw error;
      } catch (err: unknown) {
        showError("Failed to persist dark mode: " + (err as Error).message);
      }
    }
  };

  const toggleCompactView = async (enabled: boolean) => {
    setCompactView(enabled);
    if (userId) {
      try {
        const { error } = await supabase
          .from("user_settings")
          .upsert(
            { user_id: userId, compact_view: enabled },
            { onConflict: "user_id" }
          );
        if (error) throw error;
      } catch (err: unknown) {
        showError("Failed to persist compact view: " + (err as Error).message);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        compactView,
        toggleDarkMode,
        toggleCompactView,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
