import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { InventoryItem } from "@/types/inventory";

import {
  createMockTranslation,
  createMockUserContext,
  createMockInventoryContext,
} from "@test/mocks";

import InventoryCategorizedGrid from "../InventoryCategorizedGrid";

// Mock sub-components
vi.mock("../../CategoryManagement/CategorySection", () => ({
  default: ({
    category,
    items,
  }: {
    category: string;
    items: InventoryItem[];
  }) => (
    <div data-testid={`category-section-${category}`}>
      {category} ({items.length} items)
    </div>
  ),
}));

vi.mock("../../CategoryManagement/CategoryThresholdDialog", () => ({
  default: () => <div data-testid="threshold-dialog">Threshold Dialog</div>,
}));

const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

// Mock UserContext
const mockUserContext = createMockUserContext({ role: "admin" });
vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => mockUserContext,
}));

// Mock InventoryContext
const mockInventoryContext = createMockInventoryContext({
  categories: [],
  updateCategoryThreshold: vi.fn(),
});
vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventoryContext,
}));

const createItem = (
  id: string,
  name: string,
  category: string
): InventoryItem => ({
  id,
  name,
  category,
  sku: `SKU-${id}`,
  stock: 10,
  unit_cost: 5,
  image_url: null,
  low_stock_threshold: null,
  notes: null,
  created_at: "2023-01-01",
  location: null,
});

describe("InventoryCategorizedGrid", () => {
  const defaultProps = {
    items: [],
    selectedItems: new Set<string>(),
    onToggleItem: vi.fn(),
    onEdit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state", () => {
    render(<InventoryCategorizedGrid {...defaultProps} items={[]} />);
    expect(screen.getByText("inventory.noItemsFound")).toBeInTheDocument();
  });

  it("renders category sections for grouped items", () => {
    const items = [
      createItem("1", "Item A1", "Category A"),
      createItem("2", "Item B1", "Category B"),
      createItem("3", "Item A2", "Category A"),
    ];

    render(<InventoryCategorizedGrid {...defaultProps} items={items} />);

    expect(
      screen.getByTestId("category-section-Category A")
    ).toBeInTheDocument();
    expect(screen.getByText("Category A (2 items)")).toBeInTheDocument();
    expect(
      screen.getByTestId("category-section-Category B")
    ).toBeInTheDocument();
    expect(screen.getByText("Category B (1 items)")).toBeInTheDocument();
  });
});
