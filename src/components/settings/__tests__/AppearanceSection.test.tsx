import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { createMockTranslation, createMockUserContext } from "@test/mocks";

import AppearanceSection from "../AppearanceSection";

// Mock contexts using centralized utilities
const mockToggleDarkMode = vi.fn();
const mockToggleCompactView = vi.fn();
const mockUser = createMockUserContext({
  darkMode: false,
  compactView: false,
  toggleDarkMode: mockToggleDarkMode,
  toggleCompactView: mockToggleCompactView,
});

const { t } = createMockTranslation();

vi.mock("@contexts/UserContextDefinition", () => ({
  useUserContext: () => mockUser,
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
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

  it("should update localStorage and dispatch event when assistant toggle is clicked", () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    render(<AppearanceSection {...defaultProps} />);

    // The name of the switch includes " (Show Button)" concatenated
    const assistantSwitch = screen.getByRole("switch", {
      name: /menu.assistant/i,
    });

    fireEvent.click(assistantSwitch);

    // It starts initialized from localStorage (default true if not "false")
    // Use click to toggle state. If it was true, it becomes false.
    // However, verification depends on initial state.
    // Let's assume default is "true" (since "assistant-fab-visible" !== "false")
    // Clicking should make it false.

    expect(setItemSpy).toHaveBeenCalled();
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe(
      "assistant-visibility-change"
    );
  });
});
