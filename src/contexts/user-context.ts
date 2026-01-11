import { createContext } from "react";

export interface UserContextType {
    displayName: string;
    avatarUrl: string;
    role: string;
    language: "fr" | "en" | "ar";
    lowStockThreshold: number;
    setUserProfile: (profile: {
        displayName?: string;
        avatarUrl?: string;
    }) => void;
    setLanguage: (lang: "fr" | "en" | "ar") => void;
    setLowStockThreshold: (threshold: number) => void;
    loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);
