import React from "react";

import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  createMockAlertContext,
  createMockInventoryContext,
} from "@test/mocks";
import { render, screen, waitFor } from "@test/test-utils";

import App from "../../App";

// Mock react-router-dom to use MemoryRouter instead of BrowserRouter (which App uses)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    BrowserRouter: actual.MemoryRouter,
  };
});

// Mock dependencies
vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../components/RealtimeNotifications", () => ({
  default: () => null,
}));

vi.mock("../../components/Layout", async () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { Outlet } = (await vi.importActual("react-router-dom")) as {
    Outlet: React.ComponentType;
  };
  return {
    default: () => (
      <div>
        Layout Component
        <Outlet />
      </div>
    ),
  };
});

vi.mock("../../components/OfflineFallback", () => ({
  default: () => <div>Offline Fallback</div>,
}));

vi.mock("../../components/ErrorBoundary", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../../supabaseClient", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    }),
  },
}));

// Mock child pages to avoid testing their internals and focus on routing
vi.mock("../../pages/Login", () => ({ default: () => <div>Login Page</div> }));
vi.mock("../../pages/Dashboard", () => ({
  default: () => <div>Dashboard Page</div>,
}));

// Mock useUserContext to control auth state
const mockUseUserContext = vi.fn();

vi.mock("../../contexts/UserContext", () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useUserContext: () => mockUseUserContext() as unknown,
}));

vi.mock("../../contexts/AlertContext", () => ({
  AlertProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAlert: () => createMockAlertContext(),
}));

vi.mock("../../contexts/InventoryContext", () => ({
  InventoryProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useInventoryContext: () => createMockInventoryContext(),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    mockUseUserContext.mockReturnValue({
      session: null,
      loading: true,
      darkMode: false,
      compactView: false,
    });

    render(<App />, { includeRouter: false });
    // Check for loading indicator
    // The loading screen has "Logo" alt text
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  it.skip("redirects to login when not authenticated", async () => {
    mockUseUserContext.mockReturnValue({
      session: null,
      loading: false,
      darkMode: false,
      compactView: false,
    });

    // We need to wait for lazy load of Login page
    render(<App />, { includeRouter: false });

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  it("renders protected route when authenticated", async () => {
    mockUseUserContext.mockReturnValue({
      session: { user: { id: "1" } },
      loading: false,
      darkMode: false,
      compactView: false,
    });

    render(<App />, { includeRouter: false });

    await waitFor(() => {
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });
  });

  it("shows offline message when offline", async () => {
    mockUseUserContext.mockReturnValue({
      session: { user: { id: "1" } },
      loading: false,
      darkMode: false,
      compactView: false,
    });

    // Mock navigator.onLine by replacing the navigator object
    Object.defineProperty(window, "navigator", {
      value: { onLine: false },
      configurable: true,
    });

    render(<App />, { includeRouter: false });

    await waitFor(() => {
      expect(screen.getByText("common.offline")).toBeInTheDocument();
    });
  });
});
