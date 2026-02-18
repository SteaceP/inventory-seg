import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import SidebarHeader from "../SidebarHeader";

// Mock translation hook
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("SidebarHeader", () => {
  const mockOnToggle = vi.fn();

  const defaultProps = {
    collapsed: false,
    isMobile: false,
    compactView: false,
    onToggle: mockOnToggle,
  };

  it("renders correctly when expanded", () => {
    render(<SidebarHeader {...defaultProps} />);
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("app.menuTitle")).toBeInTheDocument();
    expect(screen.getByLabelText("collapse menu")).toBeInTheDocument();
  });

  it("renders correctly when collapsed", () => {
    render(<SidebarHeader {...defaultProps} collapsed={true} />);
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.queryByText("app.menuTitle")).not.toBeInTheDocument();
    expect(screen.getByLabelText("expand menu")).toBeInTheDocument();
  });

  it("renders correctly on mobile", () => {
    render(<SidebarHeader {...defaultProps} isMobile={true} />);
    expect(screen.getByText("app.menuTitle")).toBeVisible();
    expect(screen.getByLabelText("close menu")).toBeInTheDocument();
  });

  it("calls onToggle when button is clicked", () => {
    render(<SidebarHeader {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("collapse menu"));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
