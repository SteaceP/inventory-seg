import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const initTheme = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                const { data: settings } = await supabase
                    .from("user_settings")
                    .select("dark_mode")
                    .eq("user_id", session.user.id)
                    .single();

                if (settings) {
                    setDarkMode(settings.dark_mode ?? true);
                }
            }
        };

        initTheme();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
            if (session?.user) {
                supabase.from("user_settings")
                    .select("dark_mode")
                    .eq("user_id", session.user.id)
                    .single()
                    .then(({ data }) => {
                        if (data) setDarkMode(data.dark_mode ?? true);
                    });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleDarkMode = async (enabled: boolean) => {
        setDarkMode(enabled);
        if (userId) {
            // Opt-in: Persist immediately when toggled for better UX
            await supabase.from("user_settings").upsert(
                { user_id: userId, dark_mode: enabled },
                { onConflict: "user_id" }
            );
        }
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};
