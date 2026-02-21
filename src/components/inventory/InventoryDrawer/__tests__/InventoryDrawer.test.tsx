import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { InventoryItem } from "@/types/inventory";

import {
  createMockTranslation,
  createMockUserContext,
  createMockInventoryContext,
  createMockCategory,
  mockSupabaseClient,
} from "@test/mocks";

import InventoryDrawer from "../InventoryDrawer";

// Mock dependencies
const mocks = vi.hoisted(() => {
  return {
    handleError: vi.fn(),
  };
});

const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

// Global fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mocks.handleError,
  }),
}));

// Mock InventoryContext
const mockInventoryContext = createMockInventoryContext({
  categories: [
    createMockCategory({ name: "Test Category", low_stock_threshold: 8 }),
  ],
});
vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventoryContext,
}));

// Mock UserContext
const mockUserContext = createMockUserContext({
  lowStockThreshold: 8,
});
vi.mock("@contexts/UserContextDefinition", () => ({
  useUserContext: () => mockUserContext,
}));

// Supabase is mocked globally

const mockItem: InventoryItem = {
  id: "item1",
  name: "Test Item",
  category: "Test Category",
  sku: "SKU123",
  stock: 20,
  unit_cost: 99,
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
      quantity: 12,
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
    changes: { stock: 20, old_stock: 9 },
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

    // Set mock session
    mockSupabaseClient.helpers.setAuthSession({ access_token: "mock-token" });

    // Mock fetch for activity log
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockActivity),
    });

    mockSupabaseClient.mocks.from.mockReturnValue({
      select: mockSupabaseClient.mocks.select,
    });
  });

  it("renders nothing when item is null", () => {
    render(<InventoryDrawer {...defaultProps} item={null} />);
    expect(screen.queryByTestId("inventory-drawer")).not.toBeInTheDocument();
  });

  it("renders item details correctly", async () => {
    render(<InventoryDrawer {...defaultProps} />);

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("SKU123")).toBeInTheDocument();
    expect(screen.getByText("Test Category")).toBeInTheDocument();
    expect(screen.getAllByText("8").length).toBeGreaterThan(0);

    // Wait for the activity fetch to complete to avoid "act" warnings
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("renders stock locations", async () => {
    // Mock item with locations
    const itemWithLocations = {
      ...mockItem,
      stock_locations: [
        {
          id: "sl1",
          inventory_id: "1",
          location_id: "l1",
          quantity: 15,
          location: {
            id: "l1",
            name: "Warehouse A",
            parent_id: null,
          },
        },
      ],
    } as unknown as InventoryItem;

    render(<InventoryDrawer {...defaultProps} item={itemWithLocations} />);

    expect(screen.getByText("Warehouse A")).toBeInTheDocument();
    expect(screen.getAllByText("8").length).toBeGreaterThan(0);

    // Wait for the activity fetch to complete to avoid "act" warnings
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("fetches and renders activity log", async () => {
    render(<InventoryDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/activity?itemId=item1"),
        expect.any(Object)
      );
    });

    expect(await screen.findByText("Stock Added")).toBeInTheDocument();
  });

  it("handles fetch activity error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    render(<InventoryDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(mocks.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining("errors.loadActivity")
      );
    });
  });

  it("calls interaction handlers", async () => {
    render(<InventoryDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
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
