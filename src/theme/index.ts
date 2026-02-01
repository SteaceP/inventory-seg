import { createTheme } from "@mui/material/styles";
import { getCustomPalette } from "./colorSystem";

declare module "@mui/material/styles" {
  interface Palette {
    brand: {
      primary: string;
      secondary: string;
    };
    sidebar: {
      background: string;
      border: string;
      text: string;
    };
    navigation: {
      itemActiveText: string;
      itemActiveBackground: string;
    };
    status: {
      success: string;
      warning: string;
      info: string;
      error: string;
    };
    assistant: {
      fabBackground: string;
      fabHover: string;
      sparkle: string;
      drawerBackground: string;
      drawerBorder: string;
    };
    dashboard: {
      cardBorder: string;
    };
  }

  interface PaletteOptions {
    brand?: {
      primary: string;
      secondary: string;
    };
    sidebar?: {
      background: string;
      border: string;
      text: string;
    };
    navigation?: {
      itemActiveText: string;
      itemActiveBackground: string;
    };
    status?: {
      success: string;
      warning: string;
      info: string;
      error: string;
    };
    assistant?: {
      fabBackground: string;
      fabHover: string;
      sparkle: string;
      drawerBackground: string;
      drawerBorder: string;
    };
    dashboard?: {
      cardBorder: string;
    };
  }
}

export const getTheme = (mode: "light" | "dark") => {
  const customPalette = getCustomPalette(mode);

  return createTheme({
    palette: {
      mode,
      ...customPalette,
      primary: {
        main: "#027d6f", // Emerald Teal from logo
        light: "#4a9c8b",
        dark: "#0d576a",
      },
      secondary: {
        main: "#1a748b", // Steel Blue from logo
      },
      background: {
        default: mode === "dark" ? "#0d1117" : "#f6f8fa",
        paper: mode === "dark" ? "#161b22" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#c9d1d9" : "#1F2328",
        secondary: mode === "dark" ? "#8b949e" : "#636c76",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 800 },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
};
