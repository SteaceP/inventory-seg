import type { Theme } from "@mui/material/styles";

/**
 * Resolves a nested palette color path (e.g., "status.success" or "brand.primary")
 * to its actual color string from the theme.
 */
export const resolvePaletteColor = (
  theme: Theme,
  colorPath: string
): string => {
  const parts = colorPath.split(".");
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
  let current: any = theme.palette;
  for (const part of parts) {
    if (current && current[part]) {
      current = current[part];
    } else {
      return colorPath; // Fallback to path itself (e.g. if it's a hex or CSS color)
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */

  return typeof current === "string" ? current : colorPath;
};
