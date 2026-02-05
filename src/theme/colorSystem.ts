import type { ThemeMode, ColorCollection } from "@/types/theme";

import colors from "./colors.json";

/**
 * Generates an object structure for MUI palette based on dots in keys.
 * e.g. "assistant.fabBackground" -> { assistant: { fabBackground: "#..." } }
 */
export const getCustomPalette = (mode: ThemeMode) => {
  const palette: Record<string, Record<string, string> | string> = {};
  const colorData = colors as ColorCollection;

  Object.entries(colorData).forEach(([key, value]) => {
    const color = value[mode];
    const parts = key.split(".");

    let current = palette as Record<string, unknown>;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = color;
      } else {
        if (!current[part]) {
          current[part] = {} as Record<string, unknown>;
        }
        current = current[part] as Record<string, unknown>;
      }
    }
  });

  return palette;
};
