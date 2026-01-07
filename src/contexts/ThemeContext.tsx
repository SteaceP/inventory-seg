import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "./theme-context";
import { useAlert } from "./useAlertContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showError } = useAlert();
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("user");
  const [language, setLanguageState] = useState<"fr" | "en" | "ar">("fr");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initTheme = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // Listen for messages from service worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data.type === "SETTINGS_FETCH_ERROR") {
            showError(event.data.message);
          }
        });
      }
      if (session?.user) {
        setUserId(session.user.id);
        const { data: settings } = await supabase
          .from("user_settings")
          .select(
            "dark_mode, compact_view, display_name, avatar_url, role, language"
          )
          .eq("user_id", session.user.id)
          .single();

        if (settings) {
          setDarkMode(settings.dark_mode ?? true);
          setCompactView(settings.compact_view ?? false);
          setDisplayName(settings.display_name || "");
          setAvatarUrl(settings.avatar_url || "");
          setRole(settings.role || "user");
          setLanguageState((settings.language as "fr" | "en" | "ar") || "fr");
        }
      }
    };

    initTheme();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user) {
        supabase
          .from("user_settings")
          .select(
            "dark_mode, compact_view, display_name, avatar_url, role, language"
          )
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setDarkMode(data.dark_mode ?? true);
              setCompactView(data.compact_view ?? false);
              setDisplayName(data.display_name || "");
              setAvatarUrl(data.avatar_url || "");
              setRole(data.role || "user");
              setLanguageState((data.language as "fr" | "en" | "ar") || "fr");
            }
          });
      }
    });

    // Cleanup
    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", () => {});
      }
      subscription.unsubscribe();
    };
  }, [showError]);

  const toggleDarkMode = async (enabled: boolean) => {
    setDarkMode(enabled);
    if (userId) {
      // Opt-in: Persist immediately when toggled for better UX
      await supabase
        .from("user_settings")
        .upsert(
          { user_id: userId, dark_mode: enabled },
          { onConflict: "user_id" }
        );
    }
  };

  const toggleCompactView = async (enabled: boolean) => {
    setCompactView(enabled);
    if (userId) {
      await supabase
        .from("user_settings")
        .upsert(
          { user_id: userId, compact_view: enabled },
          { onConflict: "user_id" }
        );
    }
  };

  const setLanguage = async (lang: "fr" | "en" | "ar") => {
    setLanguageState(lang);
    if (userId) {
      try {
        const { error } = await supabase
          .from("user_settings")
          .upsert(
            { user_id: userId, language: lang },
            { onConflict: "user_id" }
          );
        if (error) throw error;
      } catch (err: unknown) {
        showError(
          "Failed to persist language to user_settings: " +
            (err as Error).message
        );
      }
    }
  };

  const setUserProfile = (profile: {
    displayName?: string;
    avatarUrl?: string;
  }) => {
    if (profile.displayName !== undefined) setDisplayName(profile.displayName);
    if (profile.avatarUrl !== undefined) setAvatarUrl(profile.avatarUrl);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        compactView,
        displayName,
        avatarUrl,
        role,
        language,
        toggleDarkMode,
        toggleCompactView,
        setUserProfile,
        setLanguage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
