import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BarcodePrinter from "./BarcodePrinter";

// Mock react-barcode
vi.mock("react-barcode", () => ({
  default: ({ value, format }: { value: string; format: string }) => (
    <div data-testid="barcode" data-value={value} data-format={format}>
      Barcode: {value} ({format})
    </div>
  ),
}));

describe("BarcodePrinter", () => {
  const mockItems = [
    { name: "Item 1", sku: "123456789012", category: "Electronics" },
    { name: "Item 2", sku: "12345", category: "Tools" },
  ];

  it("should return null when no items are provided", () => {
    const { container } = render(<BarcodePrinter items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render barcodes for all items", () => {
    const { getAllByTestId } = render(<BarcodePrinter items={mockItems} />);
    const barcodes = getAllByTestId("barcode");
    expect(barcodes).toHaveLength(2);
  });

  it("should detect UPC format for 12-digit SKUs", () => {
    const { getByTestId } = render(<BarcodePrinter items={[mockItems[0]]} />);
    const barcode = getByTestId("barcode");
    expect(barcode).toHaveAttribute("data-format", "UPC");
    expect(barcode).toHaveAttribute("data-value", "123456789012");
  });

  it("should default to CODE128 for non-standard SKUs", () => {
    const { getByTestId } = render(<BarcodePrinter items={[mockItems[1]]} />);
    const barcode = getByTestId("barcode");
    expect(barcode).toHaveAttribute("data-format", "CODE128");
  });

  it("should detect EAN13 format for 13-digit SKUs", () => {
    const items = [{ name: "Test", sku: "1234567890123", category: "Test" }];
    const { getByTestId } = render(<BarcodePrinter items={items} />);
    const barcode = getByTestId("barcode");
    expect(barcode).toHaveAttribute("data-format", "EAN13");
  });

  it("should detect EAN8 format for 8-digit SKUs", () => {
    const items = [{ name: "Test", sku: "12345678", category: "Test" }];
    const { getByTestId } = render(<BarcodePrinter items={items} />);
    const barcode = getByTestId("barcode");
    expect(barcode).toHaveAttribute("data-format", "EAN8");
  });

  it("should handle empty or null SKUs gracefully", () => {
    const items = [{ name: "Test", sku: "", category: "Test" }];
    const { getByTestId } = render(<BarcodePrinter items={items} />);
    const barcode = getByTestId("barcode");
    expect(barcode).toHaveAttribute("data-value", "N/A");
    expect(barcode).toHaveAttribute("data-format", "CODE128");
  });
});
