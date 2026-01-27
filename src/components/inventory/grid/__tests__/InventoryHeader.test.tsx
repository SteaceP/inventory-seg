import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InventoryHeader from "../InventoryHeader";
import { createMockTranslation } from "../../../../test/mocks";

// Mock translation
const { t } = createMockTranslation();
vi.mock("../../../../i18n", () => ({
  useTranslation: () => ({ t }),
}));

describe("InventoryHeader", () => {
  const defaultProps = {
    isMobile: false,
    selectedCount: 0,
    onPrint: vi.fn(),
    onScan: vi.fn(),
    onAdd: vi.fn(),
    searchQuery: "",
    onSearchChange: vi.fn(),
    onManageCategories: vi.fn(),
  };

  it("should render title and search field", () => {
    render(<InventoryHeader {...defaultProps} />);
    expect(screen.getByText("inventory.title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("inventory.search")).toBeInTheDocument();
  });

  it("should handle search input changes", () => {
    render(<InventoryHeader {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText("inventory.search");
    fireEvent.change(searchInput, { target: { value: "drill" } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("drill");
  });

  it("should show clear button when search query exists", () => {
    render(<InventoryHeader {...defaultProps} searchQuery="test" />);
    const clearButton = screen.getByTestId("ClearIcon").closest("button");
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton!);
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("");
  });

  it("should render action buttons correctly", () => {
    render(<InventoryHeader {...defaultProps} />);

    expect(screen.getByText("inventory.scan")).toBeInTheDocument();
    expect(screen.getByText("inventory.addButton")).toBeInTheDocument();
    expect(screen.getByText("inventory.categories.manage")).toBeInTheDocument();
  });

  it("should trigger action callbacks", () => {
    render(<InventoryHeader {...defaultProps} />);

    fireEvent.click(screen.getByText("inventory.scan"));
    expect(defaultProps.onScan).toHaveBeenCalled();

    fireEvent.click(screen.getByText("inventory.addButton"));
    expect(defaultProps.onAdd).toHaveBeenCalled();

    fireEvent.click(screen.getByText("inventory.categories.manage"));
    expect(defaultProps.onManageCategories).toHaveBeenCalled();
  });

  it("should show print button only when items are selected", () => {
    const { rerender } = render(
      <InventoryHeader {...defaultProps} selectedCount={0} />
    );
    expect(screen.queryByText(/inventory.printLabels/)).not.toBeInTheDocument();

    rerender(<InventoryHeader {...defaultProps} selectedCount={5} />);
    const printButton = screen.getByText((content) =>
      content.includes("inventory.printLabels")
    );
    expect(printButton).toBeInTheDocument();
    expect(printButton).toHaveTextContent("(5)");

    fireEvent.click(printButton);
    expect(defaultProps.onPrint).toHaveBeenCalled();
  });

  it("should adapt to mobile view", () => {
    render(<InventoryHeader {...defaultProps} isMobile={true} />);

    const title = screen.getByText("inventory.title");
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H5");
  });
});
