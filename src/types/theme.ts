export interface ThemeContextType {
  darkMode: boolean;
  compactView: boolean;
  toggleDarkMode: (enabled: boolean) => void | Promise<void>;
  toggleCompactView: (enabled: boolean) => void | Promise<void>;
}
