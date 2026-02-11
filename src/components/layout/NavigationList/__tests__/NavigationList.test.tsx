import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { mockSupabaseClient } from "@test/mocks";

import NavigationList from "../NavigationList";

// Mock translation hook
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Supabase
// Supabase is mocked globally

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
    NavLink: ({
      to,
      onClick,
      children,
      ...props
    }: {
      to: string;
      onClick?: (e: React.MouseEvent) => void;
      children: React.ReactNode;
    }) => (
      <a
        href={to}
        onClick={(e) => {
          e.preventDefault();
          onClick?.(e);
          mockNavigate(to);
        }}
        {...props}
      >
        {children}
      </a>
    ),
  };
});

describe("NavigationList", () => {
  const mockOnNavigate = vi.fn();
  const menuItems = [
    { text: "Dashboard", icon: <span>DashIcon</span>, path: "/" },
    { text: "Settings", icon: <span>SettingsIcon</span>, path: "/settings" },
  ];

  const defaultProps = {
    menuItems,
    collapsed: false,
    isMobile: false,
    compactView: false,
    onNavigate: mockOnNavigate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders menu items correctly", () => {
    render(
      <MemoryRouter>
        <NavigationList {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("security.signOut")).toBeInTheDocument();
  });

  it("calls navigate and onNavigate when an item is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavigationList {...defaultProps} />
      </MemoryRouter>
    );

    // Click the button by role to ensure we hit the ListItemButton which has the onClick/NavLink
    await user.click(screen.getByRole("link", { name: /Settings/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/settings");
    expect(mockOnNavigate).toHaveBeenCalled();
  });

  it("calls signOut and navigates to login when logout is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavigationList {...defaultProps} />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText("security.signOut");
    await user.click(logoutButton);

    expect(mockSupabaseClient.mocks.signOut).toHaveBeenCalled();
    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });
});
