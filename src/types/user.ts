import type { Database } from "./database.types";

/** Supported application languages */
export type Language = "fr" | "en";

/** Raw row from user_settings table */
export type UserSettingsRow =
  Database["public"]["Tables"]["user_settings"]["Row"];

/** Public user profile information */
export interface UserProfile {
  /** User's display name */
  displayName: string;
  /** URL to user's avatar image */
  avatarUrl: string;
}

/**
 * Interface for the user context managing preferences and profile.
 */
export interface UserContextType {
  /** Currently logged-in user's display name */
  displayName: string;
  /** User's avatar image URL */
  avatarUrl: string;
  /** User's system role (e.g., admin, user) */
  role: string;
  /** Preferred UI language */
  language: Language;
  /** Global threshold for low stock alerts */
  lowStockThreshold: number;
  /** Active UI theme mode */
  darkMode: boolean;
  /** Whether compact table view is enabled */
  compactView: boolean;
  /** Status of Multi-Factor Authentication */
  mfaEnabled: boolean;
  /** User's preferred navigation style */
  navigationType: "sidebar" | "bottom";
  /** Current user's unique identifier */
  userId: string | null;
  /** Bulk update user profile fields */
  setUserProfile: (profile: Partial<UserProfile>) => void;
  /** Change application language preferred by user */
  setLanguage: (lang: Language) => void | Promise<void>;
  /** Update the fallback low stock threshold */
  setLowStockThreshold: (threshold: number) => void | Promise<void>;
  /** Enable or disable dark mode */
  toggleDarkMode: (enabled: boolean) => void | Promise<void>;
  /** Enable or disable compact list view */
  toggleCompactView: (enabled: boolean) => void | Promise<void>;
  /** Change the application navigation style */
  toggleNavigationType: (type: "sidebar" | "bottom") => void | Promise<void>;
  /** Enable or disable MFA for the user account */
  setMfaEnabled: (enabled: boolean) => Promise<void>;
  /** Profile data loading state */
  loading: boolean;
}
