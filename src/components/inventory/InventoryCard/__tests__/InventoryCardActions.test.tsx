import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InventoryCardActions from "../InventoryCardActions";
import type { InventoryItem } from "../../../../types/inventory";

const mockT = vi.fn((key: string) => key);

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

describe("InventoryCardActions", () => {
  const defaultProps = {
    item: mockItem,
    isAdmin: false,
    onViewHistory: vi.fn(),
    onAdjust: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    t: mockT,
  };

  it("should show base actions for all users", () => {
    render(<InventoryCardActions {...defaultProps} />);
    expect(screen.getByText("inventory.history")).toBeInTheDocument();
    expect(screen.getByTestId("ExposureIcon")).toBeInTheDocument();

    // Admin actions should be hidden
    expect(screen.queryByTestId("EditIcon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("DeleteIcon")).not.toBeInTheDocument();
  });

  it("should show admin actions for admin users", () => {
    render(<InventoryCardActions {...defaultProps} isAdmin={true} />);
    expect(screen.getByTestId("EditIcon")).toBeInTheDocument();
    expect(screen.getByTestId("DeleteIcon")).toBeInTheDocument();
  });

  it("should trigger callbacks when buttons are clicked", () => {
    render(<InventoryCardActions {...defaultProps} isAdmin={true} />);

    fireEvent.click(screen.getByText("inventory.history"));
    expect(defaultProps.onViewHistory).toHaveBeenCalledWith("item-1", "Drill");

    fireEvent.click(screen.getByTestId("ExposureIcon").parentElement!);
    expect(defaultProps.onAdjust).toHaveBeenCalledWith(mockItem);

    fireEvent.click(screen.getByTestId("EditIcon").parentElement!);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockItem);

    fireEvent.click(screen.getByTestId("DeleteIcon").parentElement!);
    expect(defaultProps.onDelete).toHaveBeenCalledWith("item-1");
  });
});
