import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import UserProfile from "../UserProfile";

// Mock translation hook
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("UserProfile", () => {
  const defaultProps = {
    displayName: "John Doe",
    avatarUrl: "https://example.com/avatar.png",
    collapsed: false,
    isMobile: false,
    compactView: false,
  };

  it("renders user initials when no avatar is provided", () => {
    render(<UserProfile {...defaultProps} avatarUrl={null} />);
    expect(screen.getByText("JO")).toBeInTheDocument();
  });

  it("renders display name and status when expanded", () => {
    render(<UserProfile {...defaultProps} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("user.online")).toBeInTheDocument();
  });

  it("hides display name when collapsed and not mobile", () => {
    render(<UserProfile {...defaultProps} collapsed={true} />);
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("shows display name on mobile even if collapsed is true", () => {
    render(<UserProfile {...defaultProps} collapsed={true} isMobile={true} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("uses default text if display name is missing", () => {
    render(<UserProfile {...defaultProps} displayName={null} />);
    expect(screen.getByText("user.default")).toBeInTheDocument();
  });
});
