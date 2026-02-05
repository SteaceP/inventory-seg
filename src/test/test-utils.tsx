/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement } from "react";

import { HelmetProvider } from "@dr.pogodin/react-helmet";
import {
  render,
  type RenderOptions,
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";

import { AlertProvider } from "@/contexts/AlertContext";
import type { CustomRenderOptions } from "@/types/testing";

import { getTheme } from "../theme";

/**
 * Custom theme for tests using the actual theme generation logic
 */
const testTheme = getTheme("light");

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

  return (
    <HelmetProvider>
      <ThemeProvider theme={testTheme}>{content}</ThemeProvider>
    </HelmetProvider>
  );
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
};

// Override render method
export { customRender as render };
