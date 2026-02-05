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

import { supabase } from "@/supabaseClient";
import type {
  Language,
  UserProfile,
  UserContextType,
  UserSettingsRow,
} from "@/types/user";

import { useErrorHandler } from "@hooks/useErrorHandler";
import { logInfo } from "@utils/errorReporting";

import { useAlert } from "./AlertContext";
import { useAuth } from "./AuthContext";

import type { Session, PostgrestError } from "@supabase/supabase-js";

// Re-exporting Session for convenience if needed by consumers, though they should ideally use simple types
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
  const { session, userId, loading: authLoading } = useAuth();
  const { showError } = useAlert();
  const { handleError } = useErrorHandler();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("user");
  const [language, setLanguageState] = useState<Language>("fr");
  const [lowStockThreshold, setLowStockThresholdState] = useState(5);
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [mfaEnabled, setMfaEnabledState] = useState(false);

  // Settings loading state
  const [settingsLoading, setSettingsLoading] = useState(true);

  const profileLoadedRef = useRef(false);

  // Reset state when user logs out
  useEffect(() => {
    if (!userId) {
      profileLoadedRef.current = false;
      setDisplayName("");
      setAvatarUrl("");
      setRole("user");
      setLanguageState("fr");
      setDarkMode(true);
      setCompactView(false);
      setMfaEnabledState(false);
      setSettingsLoading(false); // No user means no settings to load
    } else {
      // User logged in, start loading settings
      setSettingsLoading(true);
    }
  }, [userId]);

  const fetchUserSettings = useCallback(
    async (uid: string) => {
      try {
        let timeoutId: ReturnType<typeof setTimeout>;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Request timed out after 5000ms")),
            5000
          );
        });

        // Actual fetch promise
        const fetchPromise = supabase
          .from("user_settings")
          .select(
            "display_name, avatar_url, role, language, low_stock_threshold, dark_mode, compact_view, mfa_enabled"
          )
          .eq("user_id", uid)
          .single();

        let result: {
          data: UserSettingsRow | null;
          error: PostgrestError | null;
        };

        try {
          // Race them
          result = (await Promise.race([fetchPromise, timeoutPromise])) as {
            data: UserSettingsRow | null;
            error: PostgrestError | null;
          };
        } finally {
          clearTimeout(timeoutId!);
        }

        const { data: settings, error } = result;

        if (error) {
          if (error.code === "PGRST116") {
            // Create default settings row
            const { error: insertError } = await supabase
              .from("user_settings")
              .insert({
                user_id: uid,
                display_name: "",
                role: "user",
                language: "fr",
                dark_mode: true,
                compact_view: false,
                low_stock_threshold: 5,
              });

            if (insertError) {
              throw insertError;
            }

            // Retry fetch
            return fetchUserSettings(uid);
          }
          throw error;
        }

        if (settings) {
          profileLoadedRef.current = true;
          const s = settings;
          setDisplayName(s.display_name || "");
          setAvatarUrl(s.avatar_url || "");
          setRole(s.role || "user");
          setLanguageState((s.language as Language) || "fr");
          setDarkMode(s.dark_mode ?? true);
          setCompactView(s.compact_view ?? false);
          setMfaEnabledState(Boolean(s.mfa_enabled));
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
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("timed out")) {
          logInfo("User settings fetch timed out (suppressing UI alert)", {
            msg,
          });
          return;
        }
        handleError(err, "Failed to fetch user settings: " + msg);
      } finally {
        setSettingsLoading(false);
      }
    },
    [handleError]
  );

  useEffect(() => {
    if (userId) {
      void fetchUserSettings(userId);
    }
  }, [userId, fetchUserSettings]);

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

  const setMfaEnabled = useCallback(
    async (enabled: boolean) => {
      try {
        setMfaEnabledState(enabled);
        if (userId) {
          await supabase
            .from("user_settings")
            .upsert(
              { user_id: userId, mfa_enabled: enabled },
              { onConflict: "user_id" }
            );
        }
      } catch {
        showError("Failed to save MFA setting");
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
      mfaEnabled,
      userId,
      session,
      setUserProfile,
      setLanguage,
      setLowStockThreshold,
      toggleDarkMode,
      toggleCompactView,
      setMfaEnabled,
      // If we are waiting for auth OR waiting for settings (and we have a user), we are loading.
      // If auth says no user, then we are not loading settings.
      loading: authLoading || (!!userId && settingsLoading),
    }),
    [
      displayName,
      avatarUrl,
      role,
      language,
      lowStockThreshold,
      darkMode,
      compactView,
      mfaEnabled,
      userId,
      session,
      setUserProfile,
      setLanguage,
      setLowStockThreshold,
      toggleDarkMode,
      toggleCompactView,
      setMfaEnabled,
      authLoading,
      settingsLoading,
    ]
  );

  return <UserContext value={contextValue}>{children}</UserContext>;
};
