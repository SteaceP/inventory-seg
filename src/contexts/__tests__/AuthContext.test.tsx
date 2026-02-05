import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { act } from "react";

// Hoist mocks
const mocks = vi.hoisted(() => {
  const handleError = vi.fn();
  const getSession = vi.fn();
  const onAuthStateChange = vi.fn();

  return {
    handleError,
    getSession,
    onAuthStateChange,
  };
});

// Mock dependencies
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mocks.handleError,
  }),
}));

vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
  },
}));

const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "",
  },
  access_token: "token",
  refresh_token: "refresh",
  expires_in: 3600,
  token_type: "bearer",
};

const TestComponent = () => {
  const { session, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="auth-state">{session ? "LoggedIn" : "LoggedOut"}</div>
      {session && <div data-testid="user-id">{session.user.id}</div>}
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("should initialize loading then settle", () => {
    mocks.getSession.mockReturnValue(new Promise(() => {})); // Hang forever

    // We can't easily wait for "never", but we can verify it starts loading
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    unmount();
  });

  it("should load session on mount", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("auth-state")).toHaveTextContent("LoggedIn");
    expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
  });

  it("should handle auth state change", async () => {
    let authCallback: (
      event: string,
      session: typeof mockSession | null
    ) => void;
    mocks.onAuthStateChange.mockImplementation((cb: typeof authCallback) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially logged out (default mock)
    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("LoggedOut");
    });

    // Simulate login
    act(() => {
      if (authCallback) {
        authCallback("SIGNED_IN", mockSession);
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("LoggedIn");
      expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
    });
  });
});
