import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import InventoryActivityPage from "../InventoryActivity";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { createMockTranslation, createMockActivity } from "@test/mocks";

// Mock error handler
const mockHandleError = vi.fn();
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

// Mock i18n
const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

// Mock Supabase
const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: () =>
        mockGetSession() as Promise<{
          data: { session: unknown };
          error: unknown;
        }>,
    },
    from: () => ({
      select: () => ({
        in: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
  takeRecords = vi.fn();
}

window.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// Create test data using factory
const mockActivities = [
  createMockActivity({
    id: "1",
    item_name: "Drill",
    action: "updated",
    changes: { action_type: "add", quantity: 5 },
  }),
  createMockActivity({
    id: "2",
    item_name: "Hammer",
    action: "deleted",
    changes: {},
  }),
];

describe("InventoryActivity Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "fake-token" } },
      error: null,
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockActivities),
    });
  });

  it("renders activity page structure", async () => {
    renderWithProviders(<InventoryActivityPage />);

    expect(
      screen.getByText("inventory.activity.globalTitle")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("inventory.searchPlaceholder")
    ).toBeInTheDocument();

    // Wait for activities to load to avoid act warning
    await waitFor(() => {
      expect(screen.getByText("Drill")).toBeInTheDocument();
    });
  });

  it("fetches and displays activities", async () => {
    renderWithProviders(<InventoryActivityPage />);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
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
      expect(globalThis.fetch).toHaveBeenCalledWith(
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
