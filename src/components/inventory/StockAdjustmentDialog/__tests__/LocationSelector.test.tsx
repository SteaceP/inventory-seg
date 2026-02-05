import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { InventoryItem } from "@/types/inventory";

import LocationSelector from "../LocationSelector";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("LocationSelector", () => {
  const mockOnLocationSelect = vi.fn();
  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const mockItem: InventoryItem = {
    id: "item-1",
    name: "Test Item",
    stock: 20,
    category: "Test",
    sku: "TEST-001",
    stock_locations: [
      {
        id: "sl-1",
        inventory_id: "item-1",
        location: "Warehouse A",
        quantity: 10,
      },
      {
        id: "sl-2",
        inventory_id: "item-1",
        location: "Warehouse B",
        quantity: 10,
        parent_location: "loc-1",
      },
    ],
  } as InventoryItem;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render location instructions", () => {
    render(
      <LocationSelector
        item={mockItem}
        onLocationSelect={mockOnLocationSelect}
        containerVariants={containerVariants}
      />
    );

    expect(screen.getByText("inventory.locationRequired")).toBeInTheDocument();
  });

  it("should render all stock locations", () => {
    render(
      <LocationSelector
        item={mockItem}
        onLocationSelect={mockOnLocationSelect}
        containerVariants={containerVariants}
      />
    );

    expect(screen.getByText("Warehouse A")).toBeInTheDocument();
    expect(screen.getByText("Warehouse B")).toBeInTheDocument();
  });

  it("should display quantity for each location", () => {
    render(
      <LocationSelector
        item={mockItem}
        onLocationSelect={mockOnLocationSelect}
        containerVariants={containerVariants}
      />
    );

    const stockTexts = screen.getAllByText(/10/);
    expect(stockTexts.length).toBeGreaterThan(0);
  });

  it("should call onLocationSelect when a location is clicked", () => {
    render(
      <LocationSelector
        item={mockItem}
        onLocationSelect={mockOnLocationSelect}
        containerVariants={containerVariants}
      />
    );

    const warehouseA = screen.getByText("Warehouse A");
    fireEvent.click(warehouseA);

    expect(mockOnLocationSelect).toHaveBeenCalledWith({
      location: "Warehouse A",
      quantity: 10,
      parent_location: undefined,
    });
  });

  it("should include parent_location when present", () => {
    render(
      <LocationSelector
        item={mockItem}
        onLocationSelect={mockOnLocationSelect}
        containerVariants={containerVariants}
      />
    );

    const warehouseB = screen.getByText("Warehouse B");
    fireEvent.click(warehouseB);

    expect(mockOnLocationSelect).toHaveBeenCalledWith({
      location: "Warehouse B",
      quantity: 10,
      parent_location: "loc-1",
    });
  });

  it("should handle empty stock_locations array", () => {
    const itemWithNoLocations = {
      ...mockItem,
      stock_locations: [],
    };

    render(
      <LocationSelector
        item={itemWithNoLocations}
        onLocationSelect={mockOnLocationSelect}
        containerVariants={containerVariants}
      />
    );

    expect(screen.queryByText("Warehouse A")).not.toBeInTheDocument();
  });
});
