import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { InventoryItem } from "@/types/inventory";

import AdjustmentForm from "../AdjustmentForm";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AdjustmentForm", () => {
  const mockOnDigit = vi.fn();
  const mockOnBackspace = vi.fn();
  const mockOnRecipientChange = vi.fn();
  const mockOnDestinationChange = vi.fn();
  const mockOnConfirm = vi.fn();

  const mockItem: InventoryItem = {
    id: "item-1",
    name: "Test Item",
    stock: 10,
    category: "Test",
    sku: "TEST-001",
  } as InventoryItem;

  const mockLocations = [
    { name: "Warehouse A" },
    { name: "Warehouse B" },
    { name: "Warehouse C" },
  ];

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const defaultProps = {
    item: mockItem,
    selectedLocation: null,
    inputValue: "",
    recipient: "",
    destinationLocation: "",
    loading: false,
    onDigit: mockOnDigit,
    onBackspace: mockOnBackspace,
    onRecipientChange: mockOnRecipientChange,
    onDestinationChange: mockOnDestinationChange,
    onConfirm: mockOnConfirm,
    locations: mockLocations,
    containerVariants,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render in add mode", () => {
    render(<AdjustmentForm {...defaultProps} mode="add" />);

    expect(screen.getByText("QUANTITY")).toBeInTheDocument();
    expect(screen.getByText("inventory.addButton")).toBeInTheDocument();
  });

  it("should render in remove mode with recipient and destination fields", () => {
    render(<AdjustmentForm {...defaultProps} mode="remove" />);

    expect(screen.getByLabelText(/recipientName/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destinationLocation/i)).toBeInTheDocument();
  });

  it("should display input value", () => {
    render(<AdjustmentForm {...defaultProps} mode="add" inputValue="15" />);

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("should display 0 when input is empty", () => {
    const { container } = render(
      <AdjustmentForm {...defaultProps} mode="add" inputValue="" />
    );

    const quantityDisplay = container.querySelector(
      '[class*="MuiTypography-h2"]'
    );
    expect(quantityDisplay).toHaveTextContent("0");
  });

  it("should call onConfirm when confirm button is clicked", () => {
    render(<AdjustmentForm {...defaultProps} mode="add" inputValue="5" />);

    const confirmButton = screen
      .getByText("inventory.addButton")
      .closest("button");
    if (confirmButton) {
      fireEvent.click(confirmButton);
      expect(mockOnConfirm).toHaveBeenCalled();
    }
  });

  it("should disable confirm button when inputValue is empty", () => {
    render(<AdjustmentForm {...defaultProps} mode="add" inputValue="" />);

    const confirmButton = screen
      .getByText("inventory.addButton")
      .closest("button");
    expect(confirmButton).toBeDisabled();
  });

  it("should disable confirm button when loading", () => {
    render(
      <AdjustmentForm
        {...defaultProps}
        mode="add"
        inputValue="5"
        loading={true}
      />
    );

    const buttons = screen.getAllByRole("button");
    const confirmButton = buttons.find(
      (btn) =>
        btn.textContent?.includes("inventory.addButton") ||
        btn.querySelector('[role="progressbar"]')
    );
    expect(confirmButton).toBeDisabled();
  });

  it("should show loading spinner when loading", () => {
    render(
      <AdjustmentForm
        {...defaultProps}
        mode="add"
        inputValue="5"
        loading={true}
      />
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should call onRecipientChange when recipient field changes", () => {
    render(<AdjustmentForm {...defaultProps} mode="remove" />);

    const recipientField = screen.getByLabelText(/recipientName/i);
    fireEvent.change(recipientField, { target: { value: "John Doe" } });

    expect(mockOnRecipientChange).toHaveBeenCalledWith("John Doe");
  });

  it("should disable confirm button when trying to remove more than available stock", () => {
    render(<AdjustmentForm {...defaultProps} mode="remove" inputValue="20" />);

    const confirmButton = screen
      .getByText("inventory.removeStock")
      .closest("button");
    expect(confirmButton).toBeDisabled();
    expect(
      screen.getByText(/⚠️.*inventory\.insufficientStock/)
    ).toBeInTheDocument();
  });

  it("should allow removal within available stock", () => {
    render(<AdjustmentForm {...defaultProps} mode="remove" inputValue="5" />);

    const confirmButton = screen
      .getByText("inventory.removeStock")
      .closest("button");
    expect(confirmButton).not.toBeDisabled();
  });

  it("should use selectedLocation quantity for max removable when available", () => {
    const selectedLocation = {
      location: "Warehouse A",
      location_id: "loc-1",
      quantity: 5,
    };

    render(
      <AdjustmentForm
        {...defaultProps}
        mode="remove"
        inputValue="6"
        selectedLocation={selectedLocation}
      />
    );

    const confirmButton = screen
      .getByText("inventory.removeStock")
      .closest("button");
    expect(confirmButton).toBeDisabled();
  });
});
