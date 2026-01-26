import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StockAdjustmentDialog from "./index";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock i18n
vi.mock("../../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock InventoryContext
vi.mock("../../../contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    locations: [{ name: "Warehouse" }, { name: "Store" }],
  }),
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockItem = {
  id: "1",
  name: "Test Item",
  stock: 10,
  category: "Test Cat",
  sku: "SKU123",
  unit_cost: 10,
  image_url: null,
  low_stock_threshold: 5,
  notes: "",
  user_id: "user1",
  created_at: "",
  updated_at: "",
  stock_locations: [],
  location: null,
};

describe("StockAdjustmentDialog", () => {
  const defaultProps = {
    open: true,
    item: mockItem,
    isMobile: false,
    onClose: vi.fn(),
    onSave: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders menu with Add and Remove buttons", () => {
    renderWithTheme(<StockAdjustmentDialog {...defaultProps} />);
    expect(screen.getByText("inventory.manageStock")).toBeInTheDocument();
    expect(screen.getByText("inventory.addStock")).toBeInTheDocument();
    expect(screen.getByText("inventory.removeStock")).toBeInTheDocument();
  });

  it("enters add mode and inputs quantity", async () => {
    renderWithTheme(<StockAdjustmentDialog {...defaultProps} />);

    fireEvent.click(screen.getByText("inventory.addStock"));

    await waitFor(() => {
      expect(screen.getByText("inventory.addButton")).toBeInTheDocument();
    });

    // Input "12" using keypad
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("2"));

    expect(screen.getByText("12")).toBeInTheDocument();

    fireEvent.click(screen.getByText("inventory.addButton"));

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      "1",
      22,
      undefined,
      "add",
      undefined,
      undefined,
      undefined
    );
  });

  it("enters remove mode and inputs quantity", async () => {
    renderWithTheme(<StockAdjustmentDialog {...defaultProps} />);

    fireEvent.click(screen.getByText("inventory.removeStock"));

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const submitButton = buttons.find((b) =>
        b.textContent?.includes("inventory.removeStock")
      );
      expect(submitButton).toBeInTheDocument();
    });

    // Input "5"
    await waitFor(() => {
      const btn5 = screen.getByRole("button", { name: "5" });
      fireEvent.click(btn5);
    });

    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((b) =>
      b.textContent?.includes("inventory.removeStock")
    );

    if (!submitButton) throw new Error("Submit button not found");

    fireEvent.click(submitButton);

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      "1",
      5,
      undefined,
      "remove",
      undefined,
      undefined,
      undefined
    );
  });

  it("shows error if removing more than stock", async () => {
    renderWithTheme(<StockAdjustmentDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("inventory.removeStock"));

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("button")
          .find((b) => b.textContent?.includes("inventory.removeStock"))
      ).toBeInTheDocument();
    });

    // Input "15" (stock is 10)
    // Wait for keypad
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
      fireEvent.click(screen.getByText("1"));
      fireEvent.click(screen.getByText("5"));
    });

    expect(screen.getByText(/inventory.insufficientStock/)).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((b) =>
      b.textContent?.includes("inventory.removeStock")
    );
    expect(submitButton).toBeDisabled();
  });

  it("handles location selection if item has locations", async () => {
    const itemWithLocs = {
      ...mockItem,
      stock_locations: [
        {
          location: "Shelf A",
          quantity: 5,
          id: "l1",
          inventory_id: "1",
          location_id: "loc1",
        },
      ],
    };

    renderWithTheme(
      <StockAdjustmentDialog {...defaultProps} item={itemWithLocs} />
    );

    fireEvent.click(screen.getByText("inventory.removeStock"));

    // Should show location selection list
    await waitFor(() => {
      expect(
        screen.getByText("inventory.locationRequired")
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Shelf A")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Shelf A"));

    // Now in remove mode
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const submitButton = buttons.find((b) =>
        b.textContent?.includes("inventory.removeStock")
      );
      expect(submitButton).toBeInTheDocument();
    });

    // Input "2"
    fireEvent.click(screen.getByText("2"));

    // Confirm
    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((b) =>
      b.textContent?.includes("inventory.removeStock")
    );
    if (!submitButton) throw new Error("Submit button not found");
    fireEvent.click(submitButton);

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      "1",
      8,
      "Shelf A",
      "remove",
      undefined,
      undefined,
      undefined
    );
  });
});
