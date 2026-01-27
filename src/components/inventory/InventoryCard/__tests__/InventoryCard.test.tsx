import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InventoryCard from "../InventoryCard";
import type { InventoryItem } from "@/types/inventory";

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

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

const mockUserContext = {
  lowStockThreshold: 5,
  role: "user",
  userId: "user-1",
  compactView: false,
};

vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => mockUserContext,
}));

const mockInventoryContext = {
  categories: [{ name: "Tools", low_stock_threshold: 10 }],
  presence: {},
};

vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventoryContext,
}));

describe("InventoryCard Integration", () => {
  const mockItem: InventoryItem = {
    id: "item-1",
    name: "Drill",
    category: "Tools",
    sku: "SKU123",
    stock: 20,
    unit_cost: 50,
    created_at: new Date().toISOString(),
    image_url: null,
    location: "Shelf A",
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

  it("should render item basic information and location", () => {
    render(<InventoryCard {...defaultProps} />);

    expect(screen.getByText("Drill")).toBeInTheDocument();
    expect(screen.getByText("SKU123")).toBeInTheDocument();
    expect(screen.getByText("Shelf A")).toBeInTheDocument();
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

  it("should pass presence data to sub-components", () => {
    mockInventoryContext.presence = {
      "user-2": { userId: "user-2", displayName: "Alice", editingId: "item-1" },
    };

    render(<InventoryCard {...defaultProps} />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });
});
