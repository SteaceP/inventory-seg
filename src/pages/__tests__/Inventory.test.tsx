import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Inventory from "../Inventory";
import { BrowserRouter } from "react-router-dom";
import type { InventoryItem } from "@/types/inventory";

// Mock dependencies
vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => ({
    compactView: false,
    role: "admin",
  }),
}));

vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    items: [],
    categories: [],
  }),
}));

vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useInventoryPage custom hook which is the main driver
const mockPageProps = vi.hoisted(() => ({
  inventoryLoading: false,
  actionLoading: false,
  open: false,
  stockDialogOpen: false,
  categoriesDialogOpen: false,
  scanOpen: false,
  editingItem: null,
  formData: {},
  selectedItems: new Set(),
  searchQuery: "",
  deleteConfirmOpen: false,
  historyDialogOpen: false,
  selectedItemForHistory: null,
  openDrawer: false,
  selectedItem: null,
  currentTab: 0,
  selectedCategory: "all",
  filteredItems: [],
  globalThreshold: 5,
  setSearchQuery: vi.fn(),
  setStockDialogOpen: vi.fn(),
  setCategoriesDialogOpen: vi.fn(),
  setScanOpen: vi.fn(),
  setFormData: vi.fn(),
  setDeleteConfirmOpen: vi.fn(),
  setHistoryDialogOpen: vi.fn(),
  setSelectedItemForHistory: vi.fn(),
  setOpenDrawer: vi.fn(),
  setCurrentTab: vi.fn(),
  setSelectedCategory: vi.fn(),
  handleOpen: vi.fn(),
  handleAdjust: vi.fn(),
  handleEdit: vi.fn(),
  handleClose: vi.fn(),
  getBarcodeFormat: vi.fn(),
  handleImageUpload: vi.fn(),
  handleStockSave: vi.fn(),
  handleSave: vi.fn(),
  handleDeleteClick: vi.fn(),
  handleDeleteConfirm: vi.fn(),
  generateSKU: vi.fn(),
  handleScanSuccess: vi.fn(),
  toggleItem: vi.fn(),
  setSearchParams: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("@hooks/useInventoryPage", () => ({
  useInventoryPage: () => mockPageProps,
}));

// Mock child components to avoid deep rendering
vi.mock("@components/inventory/grid/InventoryHeader", () => ({
  default: () => <div data-testid="inventory-header">Header</div>,
}));

vi.mock("@components/inventory/grid/InventoryCategorizedGrid", () => ({
  default: ({ items }: { items: InventoryItem[] }) => (
    <div data-testid="inventory-grid">
      {items.map((i) => (
        <div key={i.id}>{i.name}</div>
      ))}
    </div>
  ),
}));

vi.mock("@components/inventory/stats/InventoryStats", () => ({
  default: () => <div data-testid="inventory-stats">Stats</div>,
}));

vi.mock("@components/inventory/CategoryManagement/CategoryFilters", () => ({
  default: () => <div data-testid="category-filters">Filters</div>,
}));

vi.mock("@components/BarcodePrinter", () => ({
  default: () => null,
}));

vi.mock("@components/inventory/InventoryDialog/InventoryDialog", () => ({
  default: () => null,
}));

vi.mock("@components/inventory/StockAdjustmentDialog/index", () => ({
  default: () => null,
}));

vi.mock("@components/inventory/StockHistoryDialog/StockHistoryDialog", () => ({
  default: () => null,
}));

vi.mock("@components/inventory/InventoryDrawer/InventoryDrawer", () => ({
  default: () => null,
}));

vi.mock("@components/ConfirmDialog", () => ({
  default: () => null,
}));

vi.mock("@components/inventory/InventoryScanner/InventoryScanner", () => ({
  default: () => null,
}));

vi.mock(
  "@components/inventory/CategoryManagement/CategoryManagementDialog",
  () => ({
    default: () => null,
  })
);

describe("Inventory Page", () => {
  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Inventory />
      </BrowserRouter>
    );
  };

  it("renders main components", () => {
    renderComponent();
    expect(screen.getByTestId("inventory-header")).toBeInTheDocument();
    expect(screen.getByTestId("inventory-stats")).toBeInTheDocument();
    expect(screen.getByTestId("category-filters")).toBeInTheDocument();
    expect(screen.getByTestId("inventory-grid")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    vi.mocked(mockPageProps).inventoryLoading = true;
  });
});

describe("Inventory Page Interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPageProps.inventoryLoading = false;
  });

  it("displays items passed from hook", () => {
    render(
      <BrowserRouter>
        <Inventory />
      </BrowserRouter>
    );

    expect(screen.getByTestId("inventory-grid")).toBeInTheDocument();
  });
});
