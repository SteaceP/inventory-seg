import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { InventoryItem } from "@/types/inventory";

import {
  createMockTranslation,
  createMockUserContext,
  createMockInventoryContext,
  createMockCategory,
} from "@test/mocks";

import InventoryDrawer from "../InventoryDrawer";

// Mock dependencies
const mocks = vi.hoisted(() => {
  return {
    handleError: vi.fn(),
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };
});

const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mocks.handleError,
  }),
}));

// Mock InventoryContext
const mockInventoryContext = createMockInventoryContext({
  categories: [
    createMockCategory({ name: "Test Category", low_stock_threshold: 5 }),
  ],
});
vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventoryContext,
}));

// Mock UserContext
const mockUserContext = createMockUserContext({
  lowStockThreshold: 10,
});
vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => mockUserContext,
}));

vi.mock("@supabaseClient", () => ({
  supabase: {
    from: mocks.from,
  },
}));

const mockItem: InventoryItem = {
  id: "item1",
  name: "Test Item",
  category: "Test Category",
  sku: "SKU123",
  stock: 20,
  unit_cost: 10,
  image_url: null,
  low_stock_threshold: null,
  notes: "Test notes",
  created_at: "2023-01-01T00:00:00Z",
  location: null,
  stock_locations: [
    {
      id: "sl1",
      location: "Shelf A",
      quantity: 10,
      inventory_id: "item1",
    },
    {
      id: "sl2",
      location: "Shelf B",
      quantity: 10,
      inventory_id: "item1",
    },
  ],
};

const mockActivity = [
  {
    id: "act1",
    inventory_id: "item1",
    action: "Stock Added",
    created_at: "2023-01-02T10:00:00Z",
    changes: { stock: 20, old_stock: 10 },
  },
];

describe("InventoryDrawer", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    item: mockItem,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onAdjustStock: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock chain
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ order: mocks.order });
    mocks.order.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockResolvedValue({ data: mockActivity, error: null });
  });

  it("renders nothing when item is null", () => {
    const { container } = render(
      <InventoryDrawer {...defaultProps} item={null} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders item details correctly", async () => {
    render(<InventoryDrawer {...defaultProps} />);

    // Wait for effect to settle
    await waitFor(() => {
      expect(mocks.from).toHaveBeenCalled();
    });

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("Test Category")).toBeInTheDocument();
    expect(screen.getByText("SKU123")).toBeInTheDocument();
    expect(screen.getByText(/20 inventory.stock/)).toBeInTheDocument();
    expect(screen.getByText("Test notes")).toBeInTheDocument();
  });

  it("renders stock locations", async () => {
    render(<InventoryDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(mocks.from).toHaveBeenCalled();
    });

    expect(screen.getByText("inventory.drawer.locations")).toBeInTheDocument();
    expect(screen.getByText("Shelf A")).toBeInTheDocument();
    expect(screen.getByText("Shelf B")).toBeInTheDocument();
  });

  it("fetches and renders activity log", async () => {
    render(<InventoryDrawer {...defaultProps} />);

    expect(mocks.from).toHaveBeenCalledWith("inventory_activity");
    expect(mocks.eq).toHaveBeenCalledWith("inventory_id", "item1");

    await waitFor(() => {
      expect(screen.getByText("Stock Added")).toBeInTheDocument();
    });

    expect(screen.getByText(/New Stock: 20/)).toBeInTheDocument();
  });

  it("handles fetch activity error", async () => {
    const error = new Error("Fetch failed");
    mocks.limit.mockResolvedValue({ data: null, error });

    render(<InventoryDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(mocks.handleError).toHaveBeenCalledWith(
        error,
        expect.stringContaining("errors.loadActivity")
      );
    });
  });

  it("calls interaction handlers", async () => {
    render(<InventoryDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(mocks.from).toHaveBeenCalled();
    });

    // Manage Stock / Adjust Stock
    const manageButton = screen.getByText("inventory.manageStock");
    fireEvent.click(manageButton);
    expect(defaultProps.onAdjustStock).toHaveBeenCalledWith(mockItem);

    // Edit
    const editButton = screen.getByText("inventory.edit");
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockItem);

    // Delete
    const deleteButton = screen.getByText("inventory.delete");
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockItem.id);
  });
});
