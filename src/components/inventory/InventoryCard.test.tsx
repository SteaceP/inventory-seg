import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InventoryCard from "./InventoryCard";
import type { InventoryItem } from "../../types/inventory";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

// Mock hooks
const mockT = vi.fn((key: string, options?: Record<string, unknown>) => {
  if (key === "inventory.minThreshold" && options)
    return `Min: ${String(options.threshold)}`;
  return key;
});

vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

const mockUserContext = {
  lowStockThreshold: 5,
  role: "user",
  userId: "user-1",
};

vi.mock("../../contexts/UserContext", () => ({
  useUserContext: () => mockUserContext,
}));

vi.mock("../../contexts/ThemeContext", () => ({
  useThemeContext: () => ({ compactView: false }),
}));

const mockInventoryContext = {
  categories: [{ name: "Tools", low_stock_threshold: 10 }],
  presence: {},
};

vi.mock("../../contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventoryContext,
}));

describe("InventoryCard", () => {
  const mockItem: InventoryItem = {
    id: "item-1",
    name: "Drill",
    category: "Tools",
    sku: "SKU123",
    stock: 20,
    unit_cost: 50,
    created_at: new Date().toISOString(),
    image_url: null,
    location: null,
    low_stock_threshold: null,
    notes: null,
  };

  const defaultProps = {
    item: mockItem,
    isSelected: false,
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onAdjust: vi.fn(),
    onDelete: vi.fn(),
    onViewHistory: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserContext.role = "user";
    mockUserContext.lowStockThreshold = 5;
    mockInventoryContext.presence = {};
  });

  it("should render item basic information", () => {
    render(<InventoryCard {...defaultProps} />);

    expect(screen.getByText("Drill")).toBeInTheDocument();
    expect(screen.getByText("SKU123")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("should calculate effective threshold: Item > Category > Global", () => {
    // 1. Global (5) - Category (Tools: 10) - Item (null) -> Expect 10
    const { rerender } = render(<InventoryCard {...defaultProps} />);
    expect(screen.getByText("Min: 10")).toBeInTheDocument();

    // 2. Global (5) - Category (null) - Item (null) -> Expect 5
    const itemNoCat = { ...mockItem, category: "Other" };
    rerender(<InventoryCard {...defaultProps} item={itemNoCat} />);
    expect(screen.getByText("Min: 5")).toBeInTheDocument();

    // 3. Global (5) - Category (10) - Item (3) -> Expect 3
    const itemWithThresh = { ...mockItem, low_stock_threshold: 3 };
    rerender(<InventoryCard {...defaultProps} item={itemWithThresh} />);
    expect(screen.getByText("Min: 3")).toBeInTheDocument();
  });

  it("should show low stock status when stock <= threshold", () => {
    const lowStockItem = { ...mockItem, stock: 8 }; // threshold is 10 from category
    render(<InventoryCard {...defaultProps} item={lowStockItem} />);

    expect(screen.getByText("inventory.stats.lowStock")).toBeInTheDocument();
  });

  it("should show out of stock status when stock is 0", () => {
    const outOfStockItem = { ...mockItem, stock: 0 };
    render(<InventoryCard {...defaultProps} item={outOfStockItem} />);

    expect(screen.getByText("inventory.stats.outOfStock")).toBeInTheDocument();
  });

  it("should show editing indicator when another user is editing", () => {
    mockInventoryContext.presence = {
      "user-2": { userId: "user-2", displayName: "Alice", editingId: "item-1" },
    };

    render(<InventoryCard {...defaultProps} />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/inventory.isEditing/)).toBeInTheDocument();
  });

  it("should hide Admin actions for non-admin users", () => {
    mockUserContext.role = "user";
    render(<InventoryCard {...defaultProps} />);

    // History and Adjust should be visible to everyone
    expect(screen.getByTestId("HistoryIcon")).toBeInTheDocument();
    expect(screen.getByTestId("ExposureIcon")).toBeInTheDocument();

    // Edit and Delete should NOT be visible
    expect(screen.queryByTestId("EditIcon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("DeleteIcon")).not.toBeInTheDocument();
  });

  it("should show Admin actions for admin users", () => {
    mockUserContext.role = "admin";
    render(<InventoryCard {...defaultProps} />);

    expect(screen.getByTestId("EditIcon")).toBeInTheDocument();
    expect(screen.getByTestId("DeleteIcon")).toBeInTheDocument();
  });

  it("should trigger callbacks when buttons are clicked", () => {
    mockUserContext.role = "admin";
    render(<InventoryCard {...defaultProps} />);

    fireEvent.click(screen.getByTestId("EditIcon").parentElement!);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockItem);

    fireEvent.click(screen.getByTestId("ExposureIcon").parentElement!);
    expect(defaultProps.onAdjust).toHaveBeenCalledWith(mockItem);

    fireEvent.click(screen.getByTestId("DeleteIcon").parentElement!);
    expect(defaultProps.onDelete).toHaveBeenCalledWith("item-1");

    fireEvent.click(screen.getByText("inventory.history"));
    expect(defaultProps.onViewHistory).toHaveBeenCalledWith("item-1", "Drill");
  });

  it("should trigger onToggle when checkbox is clicked", () => {
    render(<InventoryCard {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(defaultProps.onToggle).toHaveBeenCalledWith("item-1", true);
  });
});
