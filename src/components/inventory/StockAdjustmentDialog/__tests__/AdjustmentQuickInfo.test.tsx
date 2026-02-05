import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import type { InventoryItem } from "@/types/inventory";

import AdjustmentQuickInfo from "../AdjustmentQuickInfo";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AdjustmentQuickInfo", () => {
  const mockItem: InventoryItem = {
    id: "item-1",
    name: "Test Item",
    stock: 25,
    category: "Test",
    sku: "TEST-001",
  } as InventoryItem;

  it("should render item name and stock", () => {
    render(<AdjustmentQuickInfo item={mockItem} selectedLocation={null} />);

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("IN STOCK")).toBeInTheDocument();
  });

  it("should not display location info when no location is selected", () => {
    render(<AdjustmentQuickInfo item={mockItem} selectedLocation={null} />);

    expect(screen.queryByText("SELECTED LOCATION")).not.toBeInTheDocument();
  });

  it("should display selected location info when location is provided", () => {
    const selectedLocation = {
      location: "Warehouse A",
      quantity: 10,
    };

    render(
      <AdjustmentQuickInfo
        item={mockItem}
        selectedLocation={selectedLocation}
      />
    );

    expect(screen.getByText("SELECTED LOCATION")).toBeInTheDocument();
    expect(screen.getByText(/Warehouse A • 10/)).toBeInTheDocument();
  });

  it("should display location with parent_location", () => {
    const selectedLocation = {
      location: "Shelf B",
      quantity: 5,
      parent_location: "Warehouse A",
    };

    render(
      <AdjustmentQuickInfo
        item={mockItem}
        selectedLocation={selectedLocation}
      />
    );

    expect(screen.getByText(/Shelf B • 5/)).toBeInTheDocument();
  });

  it("should truncate long item names", () => {
    const longNameItem: InventoryItem = {
      ...mockItem,
      name: "This is a very long item name that should be truncated with ellipsis",
    } as InventoryItem;

    const { container } = render(
      <AdjustmentQuickInfo item={longNameItem} selectedLocation={null} />
    );

    const nameElement = container.querySelector(
      '[class*="MuiTypography"][class*="body2"]'
    );
    expect(nameElement).toHaveStyle({
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    });
  });
});
