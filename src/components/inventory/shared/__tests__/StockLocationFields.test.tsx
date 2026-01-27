import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import StockLocationFields from "../StockLocationFields";

// Mock i18n
import { createMockTranslation } from "@test/mocks";

const { t } = createMockTranslation();
vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

describe("StockLocationFields", () => {
  const mockOnChange = vi.fn();
  const mockLocations = [
    { id: "l1", name: "Warehouse A" },
    { id: "l2", name: "Shelf 1", parent_id: "l1" },
  ];

  const defaultProps = {
    stockLocations: [],
    totalStock: 0,
    locations: mockLocations,
    isAdmin: true,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state", () => {
    render(<StockLocationFields {...defaultProps} />);
    expect(
      screen.getByText(/inventory.noLocationsDefined/)
    ).toBeInTheDocument();
  });

  it("renders existing locations", () => {
    const stockLocations = [{ id: "1", location: "Warehouse A", quantity: 10 }];
    render(
      <StockLocationFields
        {...defaultProps}
        stockLocations={stockLocations}
        totalStock={10}
      />
    );

    // Check if quantity input has value 10
    const inputs = screen.getAllByLabelText("inventory.stockLabel");
    expect(inputs[0]).toHaveValue(10);

    // Check location name (in mocked autocomplete)
    expect(screen.getByDisplayValue("Warehouse A")).toBeInTheDocument();
  });

  it("allows adding a location", () => {
    render(<StockLocationFields {...defaultProps} />);

    const addButton = screen.getByText("common.add");
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ quantity: 0, location: "" }),
      ]),
      0
    );
  });

  it("allows removing a location", () => {
    const stockLocations = [{ id: "1", location: "Warehouse A", quantity: 10 }];
    render(
      <StockLocationFields
        {...defaultProps}
        stockLocations={stockLocations}
        totalStock={10}
      />
    );

    const removeButtons = screen.getAllByRole("button");
    const removeButton = removeButtons.find(
      (b) => !b.textContent?.includes("common.add")
    );

    if (removeButton) {
      fireEvent.click(removeButton);
      expect(mockOnChange).toHaveBeenCalledWith([], 0);
    }
  });

  it("updates total stock when quantity changes", () => {
    const stockLocations = [{ id: "1", location: "Warehouse A", quantity: 10 }];
    render(
      <StockLocationFields
        {...defaultProps}
        stockLocations={stockLocations}
        totalStock={10}
      />
    );

    const inputs = screen.getAllByLabelText("inventory.stockLabel");
    fireEvent.change(inputs[0], { target: { value: "20" } });

    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Array), 20);
  });

  it("disables inputs when not admin", () => {
    render(<StockLocationFields {...defaultProps} isAdmin={false} />);
    const addButton = screen.getByText("common.add");
    expect(addButton).toBeDisabled();
  });
});
