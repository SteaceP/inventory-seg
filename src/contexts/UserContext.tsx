/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  use,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { supabase } from "../supabaseClient";
import { useAlert } from "./AlertContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import type {
  Language,
  UserProfile,
  UserContextType,
  UserSettingsRow,
} from "../types/user";
import type { Session } from "@supabase/supabase-js";

export const UserContext = createContext<
  (UserContextType & { session: Session | null }) | undefined
>(undefined);

export const useUserContext = () => {
  const context = use(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showError } = useAlert();
  const { handleError } = useErrorHandler();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("user");
  const [language, setLanguageState] = useState<Language>("fr");
  const [lowStockThreshold, setLowStockThresholdState] = useState(5);
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const prevUserIdRef = useRef<string | null>(null);

  const fetchUserSettings = useCallback(
    async (uid: string) => {
      try {
        const { data: settings, error } = await supabase
          .from("user_settings")
          .select(
            "display_name, avatar_url, role, language, low_stock_threshold, dark_mode, compact_view"
          )
          .eq("user_id", uid)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (settings) {
          const s = settings as UserSettingsRow;
          setDisplayName(s.display_name || "");
          setAvatarUrl(s.avatar_url || "");
          setRole(s.role || "user");
          setLanguageState((s.language as Language) || "fr");
          setDarkMode(s.dark_mode ?? true);
          setCompactView(s.compact_view ?? false);
          if (
            s.low_stock_threshold !== undefined &&
            s.low_stock_threshold !== null
          ) {
            setLowStockThresholdState(s.low_stock_threshold);
          } else {
            setLowStockThresholdState(5);
          }
        }
      } catch (err: unknown) {
        showError("Failed to fetch user settings: " + (err as Error).message);
      } finally {
        setLoading(false);
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
    const initUser = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession?.user) {
          setSession(initialSession);
          setUserId(initialSession.user.id);
          await fetchUserSettings(initialSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        handleError(err, "Failed to initialize user session");
        setLoading(false);
      }
    };

    void initUser();

    // Safety net: if loading is still true after 3 seconds, force it to false
    // This prevents infinite loading states from edge cases
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      const nextUserId = newSession?.user?.id || null;
      const prevUserId = prevUserIdRef.current;

      // Only update state if session/user actually changed to avoid unnecessary re-renders
      // asking React to bail out if values are same
      setSession(newSession);
      setUserId(nextUserId);

      prevUserIdRef.current = nextUserId;

      if (nextUserId) {
        // User is logged in
        if (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          (event === "TOKEN_REFRESHED" && nextUserId !== prevUserId)
        ) {
          // Fetch settings for new/changed sessions
          await fetchUserSettings(nextUserId);
        } else {
          // For other events (e.g., TOKEN_REFRESHED with same user), just ensure loading is false
          // Settings were already fetched by initUser or previous event
          setLoading(false);
        }
      } else {
        // User is logged out
        setDisplayName("");
        setAvatarUrl("");
        setRole("user");
        setLanguageState("fr");
        setDarkMode(true);
        setCompactView(false);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [fetchUserSettings, handleError]);

  const setLanguage = useCallback(
    async (lang: Language) => {
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
          showError("Failed to persist language: " + (err as Error).message);
        }
      }
    },
    [userId, showError]
  );

  const setLowStockThreshold = useCallback(
    async (threshold: number) => {
      setLowStockThresholdState(threshold);
      if (userId) {
        try {
          const { error } = await supabase
            .from("user_settings")
            .upsert(
              { user_id: userId, low_stock_threshold: threshold },
              { onConflict: "user_id" }
            );
          if (error) throw error;
        } catch (err: unknown) {
          showError(
            "Failed to persist low stock threshold: " + (err as Error).message
          );
        }
      }
    },
    [userId, showError]
  );

  const toggleDarkMode = useCallback(
    async (enabled: boolean) => {
      try {
        setDarkMode(enabled);
        if (userId) {
          await supabase
            .from("user_settings")
            .upsert(
              { user_id: userId, dark_mode: enabled },
              { onConflict: "user_id" }
            );
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
            .upsert(
              { user_id: userId, compact_view: enabled },
              { onConflict: "user_id" }
            );
        }
      } catch {
        showError("Failed to save view setting");
      }
    },
    [userId, showError]
  );

  const setUserProfile = useCallback((profile: Partial<UserProfile>) => {
    if (profile.displayName !== undefined) setDisplayName(profile.displayName);
    if (profile.avatarUrl !== undefined) setAvatarUrl(profile.avatarUrl);
  }, []);

  const contextValue = useMemo(
    () => ({
      displayName,
      avatarUrl,
      role,
      language,
      lowStockThreshold,
      darkMode,
      compactView,
      userId,
      session,
      setUserProfile,
      setLanguage,
      setLowStockThreshold,
      toggleDarkMode,
      toggleCompactView,
      loading,
    }),
    [
      displayName,
      avatarUrl,
      role,
      language,
      lowStockThreshold,
      darkMode,
      compactView,
      userId,
      session,
      setUserProfile,
      setLanguage,
      setLowStockThreshold,
      toggleDarkMode,
      toggleCompactView,
      loading,
    ]
  );

  return <UserContext value={contextValue}>{children}</UserContext>;
};
