import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InventoryCategorizedGrid from "./InventoryCategorizedGrid";
import type { InventoryItem } from "../../types/inventory";

// Mock child component
vi.mock("./InventoryCard", () => ({
  default: ({ item }: { item: InventoryItem }) => (
    <div data-testid={`inventory-card-${item.id}`}>{item.name}</div>
  ),
}));

// Mock contexts and hooks
const mocks = vi.hoisted(() => {
  return {
    updateCategoryThreshold: vi.fn(),
  };
});

vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../contexts/UserContext", () => ({
  useUserContext: () => ({
    role: "admin", // Default to admin for most tests
  }),
}));

vi.mock("../../contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    categories: [{ name: "CategoryA", low_stock_threshold: 5 }],
    updateCategoryThreshold: mocks.updateCategoryThreshold,
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

  it("renders categories and items", () => {
    const items = [
      createItem("1", "Item A1", "Category A"),
      createItem("2", "Item B1", "Category B"),
    ];

    render(<InventoryCategorizedGrid {...defaultProps} items={items} />);

    expect(screen.getByText("Category A")).toBeInTheDocument();
    expect(screen.getByText("Category B")).toBeInTheDocument();
    expect(screen.getByText("Item A1")).toBeInTheDocument();
    expect(screen.getByText("Item B1")).toBeInTheDocument();
  });

  it("collapses categories with more than 4 items", () => {
    const items = [];
    for (let i = 1; i <= 6; i++) {
      items.push(createItem(`${i}`, `Item ${i}`, "Category A"));
    }

    render(<InventoryCategorizedGrid {...defaultProps} items={items} />);

    // Initial state: should show first 4 items
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 4")).toBeInTheDocument();
    // Assuming ordering logic, verifying 5 and 6 are hidden.
    expect(screen.queryByText("Item 5")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();

    // Find "Show all" button
    const showAllButton = screen.getByText("common.showAll");
    fireEvent.click(showAllButton);

    // Should appear immediately due to mock
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.getByText("Item 6")).toBeInTheDocument();

    // Toggle back
    const showLessButton = screen.getByText("common.showLess");
    fireEvent.click(showLessButton);

    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();
  });

  it("allows admin to edit category threshold", () => {
    const items = [createItem("1", "Item 1", "CategoryA")];

    render(<InventoryCategorizedGrid {...defaultProps} items={items} />);

    // Find settings button. MUI Tooltip title often works as label if hovered,
    // but explicitly referencing the button via role and label "inventory.editCategoryThreshold" should work
    // because MUI usually applies title as aria-label if not present.
    const settingsBtn = screen.getByRole("button", {
      name: "inventory.editCategoryThreshold",
    });
    fireEvent.click(settingsBtn);

    // Dialog should open
    expect(
      screen.getByText("inventory.categoryThresholdTitle: CategoryA")
    ).toBeInTheDocument();

    // Input should have initial value 5 (from mock context)
    const input = screen.getByLabelText("inventory.threshold");
    expect(input).toHaveValue(5);

    // Change value
    fireEvent.change(input, { target: { value: "15" } });

    // Save
    fireEvent.click(screen.getByText("inventory.save"));

    expect(mocks.updateCategoryThreshold).toHaveBeenCalledWith("CategoryA", 15);
  });
});
