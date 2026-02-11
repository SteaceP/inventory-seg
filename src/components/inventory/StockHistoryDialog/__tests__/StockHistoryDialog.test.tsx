import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { render } from "@test/test-utils";

import StockHistoryDialog from "../StockHistoryDialog";

// Mock dependencies

const mockHandleError = vi.fn();
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

// Mock utils
vi.mock("@utils/activityUtils", () => ({
  getActivityNarrative: vi.fn(
    (activity: { action: string }) => `Activity: ${activity.action}`
  ),
  getStockChange: vi.fn(() => null),
}));

const { mockFrom, mockIn, mockT } = vi.hoisted(() => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi
      .fn()
      .mockImplementation(() => Promise.resolve({ data: [], error: null })),
    order: vi.fn().mockReturnThis(),
  };

  return {
    mockFrom: vi.fn(() => builder),
    mockIn: builder.in,
    mockT: vi.fn((key: string) => key),
  };
});

vi.mock("@/supabaseClient", () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: { session: { access_token: "mock-token" } },
          error: null,
        })
      ),
    },
  },
}));

vi.mock("@/i18n", () => ({
  useTranslation: () => ({ t: mockT, lang: "en" }),
}));

// Global fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("StockHistoryDialog", () => {
  const defaultProps = {
    open: true,
    itemId: "123",
    itemName: "Test Item",
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default success responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    mockIn.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  it("renders nothing when closed", () => {
    render(<StockHistoryDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("inventory.history")).not.toBeInTheDocument();
  });

  it("renders dialog title and item name", async () => {
    render(<StockHistoryDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getAllByText("inventory.history")[0]).toBeInTheDocument();
    });
  });

  it("shows loading state", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<StockHistoryDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  it("shows empty state when no history", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<StockHistoryDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("inventory.noHistory")).toBeInTheDocument();
    });
  });

  it("fetches and displays activity history", async () => {
    const mockActivity = [
      {
        id: "1",
        inventory_id: "123",
        user_id: "user1",
        action: "created",
        changes: {},
        created_at: "2023-01-01T12:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockActivity),
    });

    mockIn.mockResolvedValue({
      data: [{ user_id: "user1", display_name: "John Doe" }],
      error: null,
    });

    render(<StockHistoryDialog {...defaultProps} />);

    // Check if fetch was called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/activity?itemId=123"),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Activity: created")).toBeInTheDocument();
    });
  });

  it("handles error when fetching history", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<StockHistoryDialog {...defaultProps} />);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining("errors.loadActivity")
      );
    });
  });
});
