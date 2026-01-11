import { createContext } from "react";

export interface UserContextType {
    displayName: string;
    avatarUrl: string;
    role: string;
    language: "fr" | "en" | "ar";
    setUserProfile: (profile: {
        displayName?: string;
        avatarUrl?: string;
    }) => void;
    setLanguage: (lang: "fr" | "en" | "ar") => void;
    loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);
