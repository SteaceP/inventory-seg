import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { UserProvider, useUserContext } from "../UserContext";

// Hoist mocks
const mocks = vi.hoisted(() => {
  const showInfo = vi.fn();
  const showError = vi.fn();
  const handleError = vi.fn();

  // Supabase mock structure (subset needed for settings)
  const from = vi.fn();
  const upsert = vi.fn();
  const select = vi.fn();
  const eq = vi.fn();
  const single = vi.fn();
  const setLanguage = vi.fn();

  // Auth mock
  const useAuthMock = vi.fn();

  return {
    showInfo,
    showError,
    handleError,
    from,
    upsert,
    select,
    eq,
    single,
    setLanguage,
    useAuthMock,
  };
});

// Mock dependencies
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mocks.handleError,
  }),
}));

vi.mock("../AlertContext", () => ({
  useAlert: () => ({
    showInfo: mocks.showInfo,
    showError: mocks.showError,
  }),
}));

vi.mock("../AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@supabaseClient", () => ({
  supabase: {
    from: mocks.from,
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

// Test Component
const TestComponent = () => {
  const { session, userId, loading, displayName, language, setLanguage } =
    useUserContext();

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>No Session</div>;

  return (
    <div>
      <div data-testid="user-id">{userId}</div>
      <div data-testid="display-name">{displayName}</div>
      <div data-testid="language">{language}</div>
      <button onClick={() => void setLanguage("en")} data-testid="set-lang-btn">
        Set English
      </button>
    </div>
  );
};

describe("UserContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default auth state: Loading
    mocks.useAuthMock.mockReturnValue({
      session: null,
      userId: null,
      loading: true,
    });

    // Mock settings fetch chain
    // from -> select -> eq -> single
    mocks.from.mockReturnValue({
      select: mocks.select,
      upsert: mocks.upsert,
      insert: mocks.upsert, // insert acts same as upsert for mock
    });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ single: mocks.single });

    mocks.single.mockResolvedValue({
      data: {
        display_name: "Test User",
        avatar_url: "http://avatar.com",
        role: "admin",
        language: "fr",
        low_stock_threshold: 10,
      },
      error: null,
    });

    mocks.upsert.mockResolvedValue({ error: null });
  });

  it("should initialize with loading state", () => {
    // Auth loading is true by default in beforeEach
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should load user session and settings on mount", async () => {
    // Setup Auth: Logged In
    mocks.useAuthMock.mockReturnValue({
      session: mockSession,
      userId: mockSession.user.id,
      loading: false,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Waiting for settings to load
    // Note: UserContext shows "Loading..." if auth is loading OR (user exists AND settings loading)
    // Here auth is done, but settings will fetch.

    // Initially might see Loading... while fetching settings
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // After fetch completes
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
    expect(screen.getByTestId("display-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("language")).toHaveTextContent("fr");
  });

  it("should handle no session (logged out)", async () => {
    // Auth: Logged Out
    mocks.useAuthMock.mockReturnValue({
      session: null,
      userId: null,
      loading: false,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("No Session")).toBeInTheDocument();
    });
  });

  it("should update language", async () => {
    // Auth: Logged In
    mocks.useAuthMock.mockReturnValue({
      session: mockSession,
      userId: mockSession.user.id,
      loading: false,
    });

    const user = userEvent.setup();
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId("set-lang-btn"));

    // Optimistic update check
    await waitFor(() => {
      expect(screen.getByTestId("language")).toHaveTextContent("en");
    });

    // Verify DB call
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ language: "en", user_id: "test-user-id" }),
      expect.objectContaining({ onConflict: "user_id" })
    );
  });
});
