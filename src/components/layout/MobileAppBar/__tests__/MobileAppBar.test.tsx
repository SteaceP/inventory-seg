import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MobileAppBar from "../MobileAppBar";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock translation hook
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("MobileAppBar", () => {
  const mockOnToggle = vi.fn();
  const theme = createTheme();

  const defaultProps = {
    mobileOpen: false,
    compactView: false,
    onToggle: mockOnToggle,
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  it("renders correctly", () => {
    renderWithTheme(<MobileAppBar {...defaultProps} />);
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText(/APP.TITLE/i)).toBeInTheDocument();
  });

  it("calls onToggle when menu button is clicked", () => {
    renderWithTheme(<MobileAppBar {...defaultProps} />);
    const menuButton = screen.getByLabelText("open drawer");
    fireEvent.click(menuButton);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
