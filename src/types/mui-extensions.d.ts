import "@mui/material/styles";

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
