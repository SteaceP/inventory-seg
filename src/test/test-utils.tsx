/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { AlertProvider } from "@/contexts/AlertContext";
import { MemoryRouter } from "react-router-dom";

/**
 * Custom theme for tests if needed, otherwise uses default
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#027d6f",
    },
  },
});

/**
 * Custom render options
 */
export interface CustomRenderOptions extends RenderOptions {
  includeRouter?: boolean;
  includeAlerts?: boolean;
}

/**
 * AllTheProviders wrapper component
 */
const AllTheProviders = ({
  children,
  includeRouter = true,
  includeAlerts = true,
}: {
  children: React.ReactNode;
  includeRouter?: boolean;
  includeAlerts?: boolean;
}) => {
  let content = children;

  if (includeRouter) {
    content = <MemoryRouter>{content}</MemoryRouter>;
  }

  if (includeAlerts) {
    content = <AlertProvider>{content}</AlertProvider>;
  }

  return <ThemeProvider theme={theme}>{content}</ThemeProvider>;
};

/**
 * Custom render function that includes providers
 */
const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const {
    wrapper: UserWrapper,
    includeRouter = true,
    includeAlerts = true,
    ...renderOptions
  } = options || {};

  const CombinedWrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      includeRouter={includeRouter}
      includeAlerts={includeAlerts}
    >
      {UserWrapper ? <UserWrapper>{children}</UserWrapper> : children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: CombinedWrapper, ...renderOptions });
};

// Re-export everything from RTL except render
export {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
  type RenderOptions as RTLRenderOptions,
} from "@testing-library/react";

// Override render method
export { customRender as render };
