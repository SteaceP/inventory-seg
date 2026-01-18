import type { Database } from "./database.types";

export type Language = "fr" | "en" | "ar";

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
  userId: string | null;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void | Promise<void>;
  setLowStockThreshold: (threshold: number) => void | Promise<void>;
  loading: boolean;
}
