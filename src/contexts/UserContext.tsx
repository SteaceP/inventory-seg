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
import { logInfo } from "@utils/errorReporting";
import { useAlert } from "./AlertContext";
import { useErrorHandler } from "@hooks/useErrorHandler";
import type {
  Language,
  UserProfile,
  UserContextType,
  UserSettingsRow,
} from "@/types/user";
import type { Session, PostgrestError } from "@supabase/supabase-js";

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
  const profileLoadedRef = useRef(false);
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
            "display_name, avatar_url, role, language, low_stock_threshold, dark_mode, compact_view"
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

            // Retry fetch (or just set defaults directly to save a round trip)
            return fetchUserSettings(uid); // Recursive call to fetch the newly created row
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
      }
    },
    [handleError]
  );

  // ... (useEffect for SW message skipped) ...

  useEffect(() => {
    let isMounted = true;

    const initUser = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return; // Component unmounted, skip state updates

        if (initialSession?.user) {
          setSession(initialSession);
          setUserId(initialSession.user.id);
          setLoading(false);
          // Rely on onAuthStateChange to trigger the fetch, as it covers INITIAL_SESSION
          // avoiding redundant parallel requests and race conditions
        } else {
          setLoading(false);
        }
      } catch (err) {
        // Report to standardized error handler (sentry)
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
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      const nextUserId = newSession?.user?.id || null;
      const prevUserId = prevUserIdRef.current;

      // Only update state if session/user actually changed to avoid unnecessary re-renders
      // asking React to bail out if values are same
      setSession(newSession);
      setUserId(nextUserId);

      prevUserIdRef.current = nextUserId;

      if (nextUserId) {
        // User is logged in
        setLoading(false);
        if (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          (event === "TOKEN_REFRESHED" &&
            (nextUserId !== prevUserId || !profileLoadedRef.current))
        ) {
          // Fetch settings for new/changed sessions
          void fetchUserSettings(nextUserId);
        }
      } else {
        // User is logged out
        profileLoadedRef.current = false;
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
      isMounted = false; // Mark component as unmounted
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
