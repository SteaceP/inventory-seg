import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InventoryDialog from "./InventoryDialog";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock Child Components
vi.mock("./ImageUploadField", () => ({
  default: () => <div data-testid="image-upload-field">Image Upload</div>,
}));

vi.mock("./StockLocationFields", () => ({
  default: () => (
    <div data-testid="stock-location-fields">Stock Location Fields</div>
  ),
}));

vi.mock("react-barcode", () => ({
  default: ({ value }: { value: string }) => (
    <div data-testid="barcode">{value}</div>
  ),
}));

// Mock Contexts
vi.mock("../../contexts/UserContext", () => ({
  useUserContext: () => ({
    lowStockThreshold: 10,
  }),
}));

vi.mock("../../contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    categories: [
      { name: "Electronics", low_stock_threshold: 5 },
      { name: "Furniture", low_stock_threshold: null },
    ],
    locations: [{ id: "loc1", name: "Warehouse A" }],
  }),
}));

// Mock Translation
vi.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const theme = createTheme();

const defaultProps = {
  open: true,
  editingItem: null,
  formData: {},
  isMobile: false,
  onClose: vi.fn(),
  onSave: vi.fn(),
  onFormDataChange: vi.fn(),
  onGenerateSKU: vi.fn(),
  onImageUpload: vi.fn(),
  getBarcodeFormat: vi.fn().mockReturnValue("CODE128"),
  role: "admin",
  loading: false,
};

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("InventoryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly in Add mode", () => {
    renderWithTheme(<InventoryDialog {...defaultProps} />);
    expect(screen.getByText("inventory.add")).toBeInTheDocument();
    expect(screen.getByLabelText("inventory.nameLabel")).toBeInTheDocument();
    expect(screen.getByText("inventory.save")).toBeInTheDocument();
  });

  it("renders correctly in Edit mode", () => {
    renderWithTheme(
      <InventoryDialog
        {...defaultProps}
        editingItem={{
          id: "1",
          name: "Item 1",
          category: "Electronics",
          sku: "123",
          stock: 10,
          unit_cost: 10,
          image_url: null,
          low_stock_threshold: 5,
          notes: "",
          user_id: "u1",
          created_at: "",
          updated_at: "",
        }} // Partial mock is fine as long as editingItem is truthy
      />
    );
    expect(screen.getByText("inventory.edit")).toBeInTheDocument();
  });

  it("calls onFormDataChange when name input changes", () => {
    renderWithTheme(<InventoryDialog {...defaultProps} />);
    const nameInput = screen.getByLabelText("inventory.nameLabel");
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(defaultProps.onFormDataChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "New Name" })
    );
  });

  it("calls onSave when save button is clicked", () => {
    renderWithTheme(<InventoryDialog {...defaultProps} />);
    const saveButton = screen.getByText("inventory.save");
    fireEvent.click(saveButton);
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it("calls onClose when cancel button is clicked", () => {
    renderWithTheme(<InventoryDialog {...defaultProps} />);
    const cancelButton = screen.getByText("inventory.cancel");
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows barcode when SKU is present", () => {
    renderWithTheme(
      <InventoryDialog {...defaultProps} formData={{ sku: "12345" }} />
    );
    expect(screen.getByTestId("barcode")).toHaveTextContent("12345");
  });

  it("calls onGenerateSKU when refresh button is clicked (admin)", () => {
    renderWithTheme(<InventoryDialog {...defaultProps} role="admin" />);
    // The refresh button is an IconButton with specific styling, let's find by svg or just assume it is the only icon button that is not 'cancel' (which is text).
    // Actually, we can find it by the tooltip "inventory.generateSku"
    // Wait, tooltip adds title potentially on hover or as aria-label.
    // Let's use getByRole button that contains the icon.

    // Better approach: Mock Tooltip to just render children, but MUI Tooltip wraps.
    // In the code: <Tooltip title={t("inventory.generateSku")}>

    const buttons = screen.getAllByRole("button");
    // Find the one that calls generate. Alternatively, since we mocked Tooltip? No we didn't mock MUI.
    // MUI Tooltip usually adds aria-label to child element equal to title.

    // Let's try to find by label if MUI adds it, or just find any button that is likely it.
    // There is a 'refresh' icon.

    // We can rely on the fact that only admin sees it.
    // Let's rely on firing click on the button that is likely the generate button.
    // It is situated next to SKU field.

    // Let's use `fireEvent.click` on the element that looks like the generate button.
    // Or we can add an aria-label in the component if it's missing (a good practice), but I shouldn't modify source unless necessary.
    // Material UI Tooltip passes the title as aria-label to the child.
    const generateButton = screen.getByLabelText("inventory.generateSku");
    fireEvent.click(generateButton);
    expect(defaultProps.onGenerateSKU).toHaveBeenCalled();
  });

  it("disables inputs for non-admin users", () => {
    renderWithTheme(<InventoryDialog {...defaultProps} role="user" />);
    const nameInput = screen.getByLabelText("inventory.nameLabel");
    expect(nameInput).toBeDisabled();
  });
});
