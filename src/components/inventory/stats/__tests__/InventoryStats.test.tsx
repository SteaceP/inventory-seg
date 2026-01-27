import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InventoryStats from "../InventoryStats";
import type { InventoryItem } from "@/types/inventory";
import { ThemeProvider, createTheme } from "@mui/material";
import {
  createMockTranslation,
  createMockInventoryItem,
  createMockCategory,
} from "@test/mocks";

// Mock translation hook
const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

const theme = createTheme();

describe("InventoryStats", () => {
  // Generate test data using factories
  const mockItems: InventoryItem[] = [
    createMockInventoryItem({
      id: "1",
      name: "Item 1",
      stock: 20,
      category: "Tools",
    }), // OK
    createMockInventoryItem({
      id: "2",
      name: "Item 2",
      stock: 5,
      category: "Tools",
    }), // Low (threshold 10 from category)
    createMockInventoryItem({
      id: "3",
      name: "Item 3",
      stock: 0,
      category: "Electronics",
    }), // Out of stock
    createMockInventoryItem({
      id: "4",
      name: "Item 4",
      stock: 3,
      category: "Electronics",
      low_stock_threshold: 15,
    }), // Low (threshold 15 from item)
    createMockInventoryItem({
      id: "5",
      name: "Item 5",
      stock: 3,
      category: "Misc",
    }), // Low (threshold 5 from global)
  ];

  const mockCategories = [
    createMockCategory({ name: "Tools", low_stock_threshold: 10 }),
  ];
  const globalThreshold = 5;

  const defaultProps = {
    items: mockItems,
    globalThreshold,
    categories: mockCategories,
    activeTab: 0,
    onTabChange: vi.fn(),
  };

  it("should correctly calculate stats", () => {
    // Total: 5
    // Low stock:
    // - Item 2 (stock 5 <= cat thresh 10)
    // - Item 4 (stock 3 <= item thresh 15)
    // - Item 5 (stock 3 <= global thresh 5)
    // Total Low Stock: 3
    // Out of Stock:
    // - Item 3 (stock 0)
    // Total Out of Stock: 1

    render(
      <ThemeProvider theme={theme}>
        <InventoryStats {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.getByText("inventory.stats.totalItems")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    expect(screen.getByText("inventory.stats.lowStock")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("inventory.stats.outOfStock")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should trigger onTabChange when a card is clicked", () => {
    render(
      <ThemeProvider theme={theme}>
        <InventoryStats {...defaultProps} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("inventory.stats.lowStock"));
    expect(defaultProps.onTabChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText("inventory.stats.outOfStock"));
    expect(defaultProps.onTabChange).toHaveBeenCalledWith(2);
  });
});
