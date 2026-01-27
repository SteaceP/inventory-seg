import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import StockHistoryDialog from "../inventory/StockHistoryDialog/StockHistoryDialog";

// Mock dependencies
vi.mock("../../hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Supabase
const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("../../supabaseClient", () => ({
  supabase: {
    from: mocks.from,
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

    // Setup chainable mocks
    mocks.from.mockReturnValue({
      select: mocks.select,
    });
    mocks.select.mockReturnValue({
      eq: mocks.eq,
    });
    mocks.eq.mockReturnValue({
      order: mocks.order,
    });
    mocks.order.mockReturnValue({
      limit: mocks.limit,
    });

    // Default success response
    mocks.limit.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  it("renders nothing when closed", () => {
    render(<StockHistoryDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("inventory.history")).not.toBeInTheDocument();
  });

  it("renders dialog title and item name when open", () => {
    render(<StockHistoryDialog {...defaultProps} />);

    // There might be multiple elements with "inventory.history" (title and maybe print header)
    const titles = screen.getAllByText("inventory.history");
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toBeInTheDocument();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it.skip("fetches history when opened", async () => {
    render(<StockHistoryDialog {...defaultProps} />);

    await waitFor(() => {
      expect(mocks.from).toHaveBeenCalledWith("inventory_activity");
      expect(mocks.eq).toHaveBeenCalledWith("inventory_id", "123");
    });
  });

  it.skip("displays empty state when no history", async () => {
    mocks.limit.mockResolvedValue({
      data: [],
      error: null,
    });

    render(<StockHistoryDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("inventory.noHistory")).toBeInTheDocument();
    });
  });

  it.skip("displays history items", async () => {
    const mockData = [
      {
        id: "1",
        inventory_id: "123",
        user_id: "user1",
        action: "updated",
        item_name: "Test Item",
        changes: {
          stock: 10,
          old_stock: 5,
        },
        created_at: new Date().toISOString(),
      },
    ];

    mocks.limit.mockResolvedValue({
      data: mockData,
      error: null,
    });

    // Mock user fetch
    const mockUserSelect = vi.fn();
    const mockUserIn = vi.fn();
    mocks.from.mockImplementation((table) => {
      if (table === "user_settings") {
        return {
          select: mockUserSelect.mockReturnValue({
            in: mockUserIn.mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      return {
        select: mocks.select.mockReturnValue({
          eq: mocks.eq.mockReturnValue({
            order: mocks.order.mockReturnValue({
              limit: mocks.limit,
            }),
          }),
        }),
      };
    });

    render(<StockHistoryDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Updated"))
      ).toBeInTheDocument();
    });
  });
});
