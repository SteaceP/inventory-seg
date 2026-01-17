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
import type { Language, UserProfile, UserContextType } from "../types/user";

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

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
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("user");
  const [language, setLanguageState] = useState<Language>("fr");
  const [lowStockThreshold, setLowStockThresholdState] = useState(5);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserSettings = useCallback(
    async (uid: string) => {
      if (!navigator.onLine) {
        setLoading(false);
        return;
      }

      try {
        const { data: settings, error } = await supabase
          .from("user_settings")
          .select(
            "display_name, avatar_url, role, language, low_stock_threshold"
          )
          .eq("user_id", uid)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (settings) {
          const s = settings as {
            display_name: string | null;
            avatar_url: string | null;
            role: string | null;
            language: string | null;
            low_stock_threshold: number | null;
          };
          setDisplayName(s.display_name || "");
          setAvatarUrl(s.avatar_url || "");
          setRole(s.role || "user");
          setLanguageState((s.language as Language) || "fr");
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
        if (navigator.onLine) {
          showError("Failed to fetch user settings: " + (err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    const initUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserId(session.user.id);
        await fetchUserSettings(session.user.id);
      } else {
        setLoading(false);
      }
    };

    void initUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user) {
        void fetchUserSettings(session.user.id);
      } else {
        setDisplayName("");
        setAvatarUrl("");
        setRole("user");
        setLanguageState("fr");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserSettings]);

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
      userId,
      setUserProfile,
      setLanguage,
      setLowStockThreshold,
      loading,
    }),
    [
      displayName,
      avatarUrl,
      role,
      language,
      lowStockThreshold,
      userId,
      setUserProfile,
      setLanguage,
      setLowStockThreshold,
      loading,
    ]
  );

  return <UserContext value={contextValue}>{children}</UserContext>;
};
