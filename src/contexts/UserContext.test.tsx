import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { UserProvider, useUserContext } from "./UserContext";

// Hoist mocks
const mocks = vi.hoisted(() => {
  const showInfo = vi.fn();
  const showError = vi.fn();
  const handleError = vi.fn();

  // Supabase mock structure
  const getSession = vi.fn();
  const onAuthStateChange = vi.fn();
  const from = vi.fn();
  const upsert = vi.fn();
  const select = vi.fn();
  const eq = vi.fn();
  const single = vi.fn();
  const setLanguage = vi.fn();

  return {
    showInfo,
    showError,
    handleError,
    getSession,
    onAuthStateChange,
    from,
    upsert,
    select,
    eq,
    single,
    setLanguage,
  };
});

// Mock dependencies
vi.mock("../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mocks.handleError,
  }),
}));

vi.mock("./AlertContext", () => ({
  useAlert: () => ({
    showInfo: mocks.showInfo,
    showError: mocks.showError,
  }),
}));

vi.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
    from: mocks.from,
  },
}));

const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
  },
  access_token: "token",
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

    // Default happy path mocks
    mocks.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Return a valid subscription object
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    // Mock settings fetch chain
    // from -> select -> eq -> single
    mocks.from.mockReturnValue({
      select: mocks.select,
      upsert: mocks.upsert,
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
    // Delay resolution to catch loading state
    mocks.getSession.mockReturnValue(new Promise(() => {}));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should load user session and settings on mount", async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-id");
    expect(screen.getByTestId("display-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("language")).toHaveTextContent("fr");
  });

  it("should handle no session (logged out)", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
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

  it("should handle error during initialization", async () => {
    const error = new Error("Init failed");
    mocks.getSession.mockRejectedValue(error);

    render(
      <UserProvider>
        <div>Content</div>
      </UserProvider>
    );

    await waitFor(() => {
      expect(mocks.handleError).toHaveBeenCalledWith(error, expect.any(String));
    });
  });
});
