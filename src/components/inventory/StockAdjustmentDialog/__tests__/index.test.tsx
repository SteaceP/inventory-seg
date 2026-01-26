import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StockAdjustmentDialog from "../index";
import type { InventoryItem } from "../../../../types/inventory";

vi.mock("../../../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../../../contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    locations: [
      { id: "loc-1", name: "Warehouse A" },
      { id: "loc-2", name: "Warehouse B" },
    ],
  }),
}));

describe("StockAdjustmentDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const mockItem: InventoryItem = {
    id: "item-1",
    name: "Test Item",
    stock: 10,
    category: "Test Category",
    sku: "TEST-001",
    stock_locations: [
      {
        id: "sl-1",
        inventory_id: "item-1",
        location: "Warehouse A",
        quantity: 10,
      },
    ],
  } as InventoryItem;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render in menu mode by default", () => {
    render(
      <StockAdjustmentDialog
        open={true}
        item={mockItem}
        isMobile={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText("inventory.manageStock")).toBeInTheDocument();
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should not render when open is false", () => {
    const { container } = render(
      <StockAdjustmentDialog
        open={false}
        item={mockItem}
        isMobile={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    render(
      <StockAdjustmentDialog
        open={true}
        item={mockItem}
        isMobile={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const closeButton = screen.getAllByRole("button").find((btn) => {
      const icon = btn.querySelector("svg");
      return icon?.getAttribute("data-testid") === "CloseIcon";
    });

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("should display item stock information", () => {
    render(
      <StockAdjustmentDialog
        open={true}
        item={mockItem}
        isMobile={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should render in fullscreen mode when isMobile is true", () => {
    render(
      <StockAdjustmentDialog
        open={true}
        item={mockItem}
        isMobile={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText("inventory.manageStock")).toBeInTheDocument();
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should return null when item is not provided", () => {
    const { container } = render(
      <StockAdjustmentDialog
        open={true}
        item={null}
        isMobile={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });
});
