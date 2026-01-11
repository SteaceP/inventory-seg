export type Language = "fr" | "en" | "ar";

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
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void;
  setLowStockThreshold: (threshold: number) => void;
  loading: boolean;
}
