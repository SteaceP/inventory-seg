import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CategorySection from "../CategorySection";
import type { InventoryItem } from "../../../types/inventory";

// Mock InventoryCard
vi.mock("../InventoryCard", () => ({
  default: ({ item }: { item: InventoryItem }) => (
    <div data-testid={`inventory-card-${item.id}`}>{item.name}</div>
  ),
}));

vi.mock("../../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock MUI useMediaQuery
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: () => false,
  };
});

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const createItem = (id: string, name: string): InventoryItem => ({
  id,
  name,
  category: "Test",
  sku: `SKU-${id}`,
  stock: 10,
  unit_cost: 5,
  image_url: null,
  low_stock_threshold: null,
  notes: null,
  created_at: "2023-01-01",
  location: null,
});

describe("CategorySection", () => {
  const defaultProps = {
    category: "Category A",
    items: [createItem("1", "Item 1"), createItem("2", "Item 2")],
    collapsed: false,
    isAdmin: true,
    selectedCategory: null,
    selectedItems: new Set<string>(),
    compactView: false,
    onToggleCategory: vi.fn(),
    onEditThreshold: vi.fn(),
    onToggleItem: vi.fn(),
    onEdit: vi.fn(),
  };

  it("renders category name and items", () => {
    render(<CategorySection {...defaultProps} />);

    expect(screen.getByText("Category A")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("shows only first 4 items when collapsed", () => {
    const manyItems = [];
    for (let i = 1; i <= 6; i++) {
      manyItems.push(createItem(`${i}`, `Item ${i}`));
    }
    render(
      <CategorySection {...defaultProps} items={manyItems} collapsed={true} />
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 4")).toBeInTheDocument();
    expect(screen.queryByText("Item 5")).not.toBeInTheDocument();
  });

  it("calls onToggleCategory when header is clicked (if more than 4 items)", () => {
    const manyItems = [];
    for (let i = 1; i <= 5; i++) {
      manyItems.push(createItem(`${i}`, `Item ${i}`));
    }
    render(<CategorySection {...defaultProps} items={manyItems} />);

    fireEvent.click(screen.getByText("Category A"));
    expect(defaultProps.onToggleCategory).toHaveBeenCalledWith("Category A");
  });

  it("calls onEditThreshold when settings icon is clicked", () => {
    render(<CategorySection {...defaultProps} />);

    fireEvent.click(screen.getByTestId("SettingsIcon").parentElement!);
    expect(defaultProps.onEditThreshold).toHaveBeenCalledWith("Category A");
  });
});
