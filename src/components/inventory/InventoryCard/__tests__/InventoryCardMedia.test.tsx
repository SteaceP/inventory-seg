import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import type { InventoryItem } from "@/types/inventory";

import InventoryCardMedia from "../InventoryCardMedia";

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

describe("InventoryCardMedia", () => {
  const defaultProps = {
    item: mockItem,
    isSelected: false,
    onToggle: vi.fn(),
    compactView: false,
    isBeingEdited: false,
    editorNames: "",
    t: mockT,
  };

  it("should render category chip and placeholder when no image", () => {
    render(<InventoryCardMedia {...defaultProps} />);
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByTestId("InventoryIcon")).toBeInTheDocument();
  });

  it("should render item image when image_url is provided", () => {
    const itemWithImage = {
      ...mockItem,
      image_url: "http://example.com/image.jpg",
    };
    render(<InventoryCardMedia {...defaultProps} item={itemWithImage} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2); // One for blur background, one for main image
    expect(images[1]).toHaveAttribute("src", "http://example.com/image.jpg");
  });

  it("should show editing indicator when isBeingEdited is true", () => {
    render(
      <InventoryCardMedia
        {...defaultProps}
        isBeingEdited={true}
        editorNames="Alice"
      />
    );
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/inventory.isEditing/)).toBeInTheDocument();
  });

  it("should trigger onToggle and stop propagation when checkbox is clicked", () => {
    render(<InventoryCardMedia {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(defaultProps.onToggle).toHaveBeenCalledWith("item-1", true);
  });
});
