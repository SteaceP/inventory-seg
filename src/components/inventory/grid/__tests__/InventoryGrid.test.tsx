import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import type { InventoryItem } from "@/types/inventory";

import { createMockUserContext, createMockInventoryItem } from "@test/mocks";

import InventoryGrid from "../InventoryGrid";

// Mock framer-motion

// Mock InventoryCard to simplify testing
vi.mock("../../InventoryCard/InventoryCard", () => ({
  default: ({ item }: { item: InventoryItem }) => (
    <div data-testid={`card-${item.id}`}>{item.name}</div>
  ),
}));

// Mock UserContext
const mockUser = createMockUserContext({ compactView: false });
vi.mock("@contexts/UserContextDefinition", () => ({
  useUserContext: () => mockUser,
}));

const theme = createTheme();

describe("InventoryGrid", () => {
  // Generate test data using factory
  const mockItems: InventoryItem[] = Array.from({ length: 20 }, (_, i) =>
    createMockInventoryItem({
      id: `item-${i}`,
      name: `Item ${i}`,
      category: "Test",
      stock: 10,
    })
  );

  const defaultProps = {
    items: mockItems,
    selectedItems: new Set<string>(),
    onToggleItem: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("should render initial page of items", () => {
    render(
      <ThemeProvider theme={theme}>
        <InventoryGrid {...defaultProps} items={mockItems.slice(0, 5)} />
      </ThemeProvider>
    );

    // Should show all 5 items since they're less than PAGE_SIZE (8)
    expect(screen.getByTestId("card-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("card-item-4")).toBeInTheDocument();
  });

  it("should show sentinel for pagination when items exceed visible count", () => {
    render(
      <ThemeProvider theme={theme}>
        <InventoryGrid {...defaultProps} />
      </ThemeProvider>
    );

    // Should render first 8 items (PAGE_SIZE)
    expect(screen.getByTestId("card-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("card-item-7")).toBeInTheDocument();

    // Should not render item beyond PAGE_SIZE yet
    expect(screen.queryByTestId("card-item-8")).not.toBeInTheDocument();

    // Sentinel should exist for infinite scroll
    expect(screen.getByTestId("infinite-scroll-sentinel")).toBeInTheDocument();
  });

  it("should render all items when count is less than PAGE_SIZE", () => {
    const fewItems = mockItems.slice(0, 3);
    render(
      <ThemeProvider theme={theme}>
        <InventoryGrid {...defaultProps} items={fewItems} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("card-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("card-item-2")).toBeInTheDocument();

    // No sentinel should be rendered
    expect(
      screen.queryByTestId("infinite-scroll-sentinel")
    ).not.toBeInTheDocument();
  });
});
