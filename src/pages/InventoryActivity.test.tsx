import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import InventoryActivityPage from "./InventoryActivity";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mocks
const mockHandleError = vi.fn();
const mockGetSession = vi.fn();

vi.mock("../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

vi.mock("../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) =>
        mockGetSession(...args) as Promise<unknown>,
    },
    from: () => ({
      select: () => ({
        in: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}));

// Mock real utils or use them. Using real utils requires them to be pure.
// getActivityNarrative takes 't'.
// Let's rely on real utils if they are available, assuming they are pure.
// If they cause trouble, we mock them.
// For now, let's keep them real to test integration.

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  unobserve: vi.fn(),
  takeRecords: vi.fn(),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

const mockActivities = [
  {
    id: "1",
    item_name: "Drill",
    action: "updated",
    user_id: "user1",
    created_at: new Date().toISOString(),
    changes: { action_type: "add", quantity: 5 },
  },
  {
    id: "2",
    item_name: "Hammer",
    action: "deleted",
    user_id: "user2",
    created_at: new Date().toISOString(),
    changes: {},
  },
];

describe("InventoryActivity Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "fake-token" } },
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockActivities),
    });
  });

  it("renders activity page structure", () => {
    renderWithProviders(<InventoryActivityPage />);

    expect(
      screen.getByText("inventory.activity.globalTitle")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("inventory.searchPlaceholder")
    ).toBeInTheDocument();
  });

  it("fetches and displays activities", async () => {
    renderWithProviders(<InventoryActivityPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/activity?"),
        expect.any(Object)
      );
      expect(screen.getByText("Drill")).toBeInTheDocument();
      expect(screen.getByText("Hammer")).toBeInTheDocument();
    });
  });

  it("handles empty state", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderWithProviders(<InventoryActivityPage />);

    await waitFor(() => {
      expect(screen.getByText("inventory.noHistory")).toBeInTheDocument();
    });
  });

  it("handles search input", async () => {
    renderWithProviders(<InventoryActivityPage />);

    const searchInput = screen.getByPlaceholderText(
      "inventory.searchPlaceholder"
    );
    fireEvent.change(searchInput, { target: { value: "Drill" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("searchTerm=Drill"),
        expect.any(Object)
      );
    });
  });

  it("handles fetch error", async () => {
    const error = new Error("Fetch failed");
    mockFetch.mockRejectedValueOnce(error);

    renderWithProviders(<InventoryActivityPage />);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        error,
        expect.stringContaining("errors.loadActivity")
      );
    });
  });
});
