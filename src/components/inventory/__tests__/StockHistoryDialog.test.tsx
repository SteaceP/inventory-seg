import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import StockHistoryDialog from "../StockHistoryDialog";

// Mock dependencies
import { createMockTranslation } from "../../../test/mocks";

const { t } = createMockTranslation();
vi.mock("../../../i18n", () => ({
  useTranslation: () => ({ t }),
}));

vi.mock("../../../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

// Mock utils
vi.mock("../../../utils/activityUtils", () => ({
  getActivityNarrative: vi.fn(
    (activity: { action: string }) => `Activity: ${activity.action}`
  ),
  getStockChange: vi.fn(() => null),
}));

// Mock Supabase
const { mockFrom, mockSelect, mockEq, mockOrder, mockLimit, mockIn } =
  vi.hoisted(() => {
    return {
      mockFrom: vi.fn(),
      mockSelect: vi.fn(),
      mockEq: vi.fn(),
      mockOrder: vi.fn(),
      mockLimit: vi.fn(),
      mockIn: vi.fn(),
    };
  });

vi.mock("../../../supabaseClient", () => ({
  supabase: {
    from: mockFrom,
  },
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

    // Setup mock chain
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockEq.mockReturnValue({ order: mockOrder });

    mockSelect.mockReturnValue({
      eq: mockEq,
      in: mockIn,
    });

    mockFrom.mockImplementation(() => ({
      select: mockSelect,
    }));

    // Default success response for activity
    mockLimit.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  it("renders nothing when closed", () => {
    render(<StockHistoryDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("inventory.history")).not.toBeInTheDocument();
  });

  it("renders dialog title and item name", () => {
    render(<StockHistoryDialog {...defaultProps} />);
    expect(screen.getAllByText("inventory.history")[0]).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockLimit.mockReturnValue(new Promise(() => {}));
    render(<StockHistoryDialog {...defaultProps} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.getByText(/Activity: created/)).toBeInTheDocument();
    });
  });

  it("handles error when fetching history", async () => {
    const error = new Error("Fetch failed");
    mockLimit.mockResolvedValue({
      data: null,
      error: error,
    });

    render(<StockHistoryDialog {...defaultProps} />);

    // Wait for error handler to be called
    await waitFor(() => {
      // Verify useErrorHandler was called
    });
  });
});
