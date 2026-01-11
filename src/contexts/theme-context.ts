import { createContext } from "react";

export interface ThemeContextType {
  darkMode: boolean;
  compactView: boolean;
  toggleDarkMode: (enabled: boolean) => void;
  toggleCompactView: (enabled: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
