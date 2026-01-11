import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { UserContext } from "./user-context";
import { useAlert } from "./useAlertContext";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { showError } = useAlert();
    const [displayName, setDisplayName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [role, setRole] = useState("user");
    const [language, setLanguageState] = useState<"fr" | "en" | "ar">("fr");
    const [lowStockThreshold, setLowStockThresholdState] = useState(5);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserSettings = useCallback(async (uid: string) => {
        try {
            const { data: settings, error } = await supabase
                .from("user_settings")
                .select("display_name, avatar_url, role, language, low_stock_threshold")
                .eq("user_id", uid)
                .single();

            if (error && error.code !== "PGRST116") throw error;

            if (settings) {
                setDisplayName(settings.display_name || "");
                setAvatarUrl(settings.avatar_url || "");
                setRole(settings.role || "user");
                setLanguageState((settings.language as "fr" | "en" | "ar") || "fr");
                if (settings.low_stock_threshold !== undefined) {
                    setLowStockThresholdState(settings.low_stock_threshold);
                }
            }
        } catch (err: unknown) {
            showError("Failed to fetch user settings: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [showError]);

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

        initUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
            if (session?.user) {
                fetchUserSettings(session.user.id);
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
                    "Failed to persist language: " + (err as Error).message
                );
            }
        }
    };

    const setLowStockThreshold = async (threshold: number) => {
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
    };

    const setUserProfile = (profile: {
        displayName?: string;
        avatarUrl?: string;
    }) => {
        if (profile.displayName !== undefined) setDisplayName(profile.displayName);
        if (profile.avatarUrl !== undefined) setAvatarUrl(profile.avatarUrl);
    };

    return (
        <UserContext.Provider
            value={{
                displayName,
                avatarUrl,
                role,
                language,
                lowStockThreshold,
                setUserProfile,
                setLanguage,
                setLowStockThreshold,
                loading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
