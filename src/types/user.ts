import type { Database } from "./database.types";

export type Language = "fr" | "en";

export type UserSettingsRow =
  Database["public"]["Tables"]["user_settings"]["Row"];

export interface UserProfile {
  displayName: string;
  avatarUrl: string;
}

export interface UserContextType {
  displayName: string;
  avatarUrl: string;
  role: string;
  language: Language;
  lowStockThreshold: number;
  darkMode: boolean;
  compactView: boolean;
  mfaEnabled: boolean;
  userId: string | null;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void | Promise<void>;
  setLowStockThreshold: (threshold: number) => void | Promise<void>;
  toggleDarkMode: (enabled: boolean) => void | Promise<void>;
  toggleCompactView: (enabled: boolean) => void | Promise<void>;
  setMfaEnabled: (enabled: boolean) => Promise<void>;
  loading: boolean;
}
