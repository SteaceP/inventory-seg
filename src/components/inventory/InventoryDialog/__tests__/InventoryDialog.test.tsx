import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import {
  createMockTranslation,
  createMockUserContext,
  createMockInventoryContext,
  createMockCategory,
  createMockLocation,
} from "@test/mocks";

import InventoryDialog from "../InventoryDialog";

// Mock Child Components
vi.mock("@components/inventory/shared/ImageUploadField", () => ({
  default: () => <div data-testid="image-upload-field">Image Upload</div>,
}));

vi.mock("@components/inventory/shared/StockLocationFields", () => ({
  default: () => (
    <div data-testid="stock-location-fields">Stock Location Fields</div>
  ),
}));

// Mock LazyBarcode instead of react-barcode directly
vi.mock("@components/inventory/shared/LazyBarcode", () => ({
  default: ({ value }: { value: string }) => (
    <div data-testid="barcode">{value}</div>
  ),
}));

// Mock Contexts using centralized utilities
const mockUser = createMockUserContext({ lowStockThreshold: 10 });
const mockInventory = createMockInventoryContext({
  categories: [
    createMockCategory({ name: "Electronics", low_stock_threshold: 5 }),
    createMockCategory({ name: "Furniture", low_stock_threshold: null }),
  ],
  locations: [createMockLocation({ id: "loc1", name: "Warehouse A" })],
});
const { t } = createMockTranslation();

vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => mockUser,
}));

vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventory,
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
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
          location: null,
          low_stock_threshold: 5,
          notes: "",
          created_at: "",
        }}
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
