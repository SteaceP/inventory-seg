import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { supabase } from "@/supabaseClient";

import NavigationList from "../NavigationList";

// Mock translation hook
vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Supabase
vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
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

  it("calls navigate and onNavigate when an item is clicked", () => {
    render(
      <MemoryRouter>
        <NavigationList {...defaultProps} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Settings"));
    expect(mockNavigate).toHaveBeenCalledWith("/settings");
    expect(mockOnNavigate).toHaveBeenCalled();
  });

  it("calls signOut and navigates to login when logout is clicked", async () => {
    render(
      <MemoryRouter>
        <NavigationList {...defaultProps} />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText("security.signOut");
    fireEvent.click(logoutButton);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(supabase.auth.signOut).toHaveBeenCalled();
    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });
});
