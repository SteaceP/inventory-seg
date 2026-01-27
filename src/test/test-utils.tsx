/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

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
 * AllTheProviders wrapper component
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

/**
 * Custom render function that includes providers
 */
const customRender = (ui: ReactElement, options?: RenderOptions) => {
  const { wrapper: UserWrapper, ...renderOptions } = options || {};

  const CombinedWrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders>
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
