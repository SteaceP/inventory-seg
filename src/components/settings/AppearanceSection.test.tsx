import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppearanceSection from "./AppearanceSection";

// Mock contexts
const mockToggleDarkMode = vi.fn();
const mockToggleCompactView = vi.fn();

vi.mock("../../contexts/ThemeContext", () => ({
  useThemeContext: () => ({
    toggleDarkMode: mockToggleDarkMode,
    toggleCompactView: mockToggleCompactView,
  }),
}));

vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AppearanceSection", () => {
  const defaultProps = {
    darkMode: false,
    compactView: false,
    onDarkModeChange: vi.fn(),
    onCompactViewChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dark mode and compact view switches", () => {
    render(<AppearanceSection {...defaultProps} />);

    expect(screen.getByText("appearance.darkMode")).toBeInTheDocument();
    expect(screen.getByText("appearance.compactView")).toBeInTheDocument();
  });

  it("should show switch as unchecked when prop is false", () => {
    render(<AppearanceSection {...defaultProps} />);

    const darkModeSwitch = screen.getByRole("switch", {
      name: /appearance.darkMode/i,
    });
    expect(darkModeSwitch).not.toBeChecked();
  });

  it("should show switch as checked when prop is true", () => {
    render(<AppearanceSection {...defaultProps} darkMode={true} />);

    const darkModeSwitch = screen.getByRole("switch", {
      name: /appearance.darkMode/i,
    });
    expect(darkModeSwitch).toBeChecked();
  });

  it("should call both onDarkModeChange and toggleDarkMode when dark mode is toggled", () => {
    render(<AppearanceSection {...defaultProps} />);

    const darkModeSwitch = screen.getByRole("switch", {
      name: /appearance.darkMode/i,
    });
    fireEvent.click(darkModeSwitch);

    expect(defaultProps.onDarkModeChange).toHaveBeenCalledWith(true);
    expect(mockToggleDarkMode).toHaveBeenCalledWith(true);
  });

  it("should call both onCompactViewChange and toggleCompactView when compact view is toggled", () => {
    render(<AppearanceSection {...defaultProps} />);

    const compactViewSwitch = screen.getByRole("switch", {
      name: /appearance.compactView/i,
    });
    fireEvent.click(compactViewSwitch);

    expect(defaultProps.onCompactViewChange).toHaveBeenCalledWith(true);
    expect(mockToggleCompactView).toHaveBeenCalledWith(true);
  });
});
