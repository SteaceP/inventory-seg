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

const { mockFrom, mockLimit, mockIn, mockT } = vi.hoisted(() => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi
      .fn()
      .mockImplementation(() => Promise.resolve({ data: [], error: null })),
    order: vi.fn().mockReturnThis(),
    limit: vi
      .fn()
      .mockImplementation(() => Promise.resolve({ data: [], error: null })),
  };

  return {
    mockFrom: vi.fn(() => builder),
    mockLimit: builder.limit,
    mockIn: builder.in,
    mockT: vi.fn((key: string) => key),
  };
});

vi.mock("@/supabaseClient", () => ({
  supabase: {
    from: mockFrom,
  },
}));

vi.mock("@/i18n", () => ({
  useTranslation: () => ({ t: mockT, lang: "en" }),
}));

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
    mockLimit.mockResolvedValue({
      data: [],
      error: null,
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
    mockLimit.mockReturnValue(new Promise(() => {}));
    render(<StockHistoryDialog {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  it("shows empty state when no history", async () => {
    mockLimit.mockResolvedValue({
      data: [],
      error: null,
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

    mockLimit.mockResolvedValue({
      data: mockActivity,
      error: null,
    });

    mockIn.mockResolvedValue({
      data: [{ user_id: "user1", display_name: "John Doe" }],
      error: null,
    });

    render(<StockHistoryDialog {...defaultProps} />);

    // Check if fetch was called
    expect(mockFrom).toHaveBeenCalledWith("inventory_activity");

    await waitFor(() => {
      expect(screen.getByText("Activity: created")).toBeInTheDocument();
    });
  });

  it("handles error when fetching history", async () => {
    const error = { message: "Fetch failed" };
    mockLimit.mockResolvedValueOnce({
      data: null,
      error: error,
    });

    render(<StockHistoryDialog {...defaultProps} />);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        error,
        expect.stringContaining("errors.loadActivity")
      );
    });
  });
});
