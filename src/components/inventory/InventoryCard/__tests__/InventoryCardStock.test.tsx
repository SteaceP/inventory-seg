import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import type { InventoryItem } from "@/types/inventory";

import InventoryCardStock from "../InventoryCardStock";

const mockT = vi.fn((key: string, options?: Record<string, unknown>) => {
  if (key === "inventory.minThreshold" && options)
    return `Min: ${String(options.threshold)}`;
  return key;
});

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

describe("InventoryCardStock", () => {
  const defaultProps = {
    item: mockItem,
    effectiveThreshold: 10,
    isLowStock: false,
    isOutOfStock: false,
    t: mockT,
  };

  it("should render stock level and threshold", () => {
    render(<InventoryCardStock {...defaultProps} />);
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Min: 10")).toBeInTheDocument();
  });

  it("should show low stock chip when isLowStock is true", () => {
    render(<InventoryCardStock {...defaultProps} isLowStock={true} />);
    expect(screen.getByText("inventory.stats.lowStock")).toBeInTheDocument();
  });

  it("should show out of stock chip when isOutOfStock is true", () => {
    render(<InventoryCardStock {...defaultProps} isOutOfStock={true} />);
    expect(screen.getByText("inventory.stats.outOfStock")).toBeInTheDocument();
  });

  it("should calculate progress bar value correctly", () => {
    const { container } = render(
      <InventoryCardStock
        {...defaultProps}
        item={{ ...mockItem, stock: 5 }}
        effectiveThreshold={10}
      />
    );
    const progress = container.querySelector(".MuiLinearProgress-root");
    expect(progress).toHaveAttribute("aria-valuenow", "50");
  });
});
