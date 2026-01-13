import { use } from "react";
import { ThemeContext } from "./theme-context";

export const useThemeContext = () => {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};
