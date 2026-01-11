export interface ThemeContextType {
  darkMode: boolean;
  compactView: boolean;
  toggleDarkMode: (enabled: boolean) => void;
  toggleCompactView: (enabled: boolean) => void;
}
