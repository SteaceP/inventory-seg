/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  use,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../supabaseClient";
import { useAlert } from "./AlertContext";

interface ThemeContextType {
  darkMode: boolean;
  compactView: boolean;
  toggleDarkMode: (enabled: boolean) => void;
  toggleCompactView: (enabled: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const useThemeContext = () => {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showError } = useAlert();
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchThemeSettings = useCallback(
    async (uid: string) => {
      try {
        const { data: settings, error } = await supabase
          .from("user_settings")
          .select("dark_mode, compact_view")
          .eq("user_id", uid)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (settings) {
          const s = settings as {
            dark_mode: boolean | null;
            compact_view: boolean | null;
          };
          setDarkMode(s.dark_mode ?? true);
          setCompactView(s.compact_view ?? false);
        }
      } catch (err: unknown) {
        showError("Failed to fetch theme settings: " + (err as Error).message);
      }
    },
    [showError]
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; message?: string };
      if (data.type === "SETTINGS_FETCH_ERROR") {
        showError(data.message || "An error occurred");
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage);
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

    void initTheme();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user) {
        void fetchThemeSettings(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchThemeSettings]);

  const toggleDarkMode = useCallback(
    async (enabled: boolean) => {
      try {
        setDarkMode(enabled);
        if (userId) {
          await supabase
            .from("user_settings")
            .update({ dark_mode: enabled })
            .eq("user_id", userId);
        }
      } catch {
        showError("Failed to save theme setting");
      }
    },
    [userId, showError]
  );

  const toggleCompactView = useCallback(
    async (enabled: boolean) => {
      try {
        setCompactView(enabled);
        if (userId) {
          await supabase
            .from("user_settings")
            .update({ compact_view: enabled })
            .eq("user_id", userId);
        }
      } catch {
        showError("Failed to save view setting");
      }
    },
    [userId, showError]
  );

  const value = useMemo(
    () => ({
      darkMode,
      compactView,
      toggleDarkMode,
      toggleCompactView,
    }),
    [darkMode, compactView, toggleDarkMode, toggleCompactView]
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
};
