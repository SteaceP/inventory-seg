export type ThemeMode = "light" | "dark";

export interface ColorDefinition {
  light: string;
  dark: string;
}

export type ColorCollection = Record<string, ColorDefinition>;
