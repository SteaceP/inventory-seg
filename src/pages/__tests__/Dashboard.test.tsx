import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  createMockTranslation,
  createMockUserContext,
  createMockInventoryContext,
  createMockInventoryItem,
  createMockCategory,
} from "@test/mocks";
import { render, screen, waitFor } from "@test/test-utils";

import Dashboard from "../Dashboard";

// Create test data using factories
const mockInventoryItems = [
  createMockInventoryItem({
    id: "1",
    name: "Item 1",
    category: "Cat1",
    stock: 10,
    low_stock_threshold: 5,
  }),
  createMockInventoryItem({
    id: "2",
    name: "Item 2",
    category: "Cat1",
    stock: 2,
    low_stock_threshold: 5,
  }), // Low stock
  createMockInventoryItem({
    id: "3",
    name: "Item 3",
    category: "Cat2",
    stock: 20,
    low_stock_threshold: 5,
  }),
];

const mockCategories = [
  createMockCategory({ name: "Cat1", low_stock_threshold: 5 }),
  createMockCategory({ name: "Cat2", low_stock_threshold: 10 }),
];

// Mock contexts using centralized utilities
const mockHandleError = vi.fn();
const mockUser = createMockUserContext({
  lowStockThreshold: 5,
  compactView: false,
});
const mockInventory = createMockInventoryContext({
  items: mockInventoryItems,
  categories: mockCategories,
});
const { t } = createMockTranslation();

vi.mock("@contexts/UserContext", () => ({
  useUserContext: () => mockUser,
}));

vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventory,
}));

vi.mock("@hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
  }),
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({ t }),
}));

vi.mock("@supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "fake-token" } },
      }),
    },
  },
}));

// Mock child components to isolate Dashboard logic
vi.mock("@components/dashboard/QuickActions/QuickActions", () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>,
}));

vi.mock("@components/dashboard/StockHealth/StockHealth", () => ({
  default: () => <div data-testid="stock-health">Stock Health</div>,
}));

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock matchMedia
globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ in: 10, out: 5 }),
    });
  });

  it("renders dashboard title and welcome message", async () => {
    render(<Dashboard />);
    expect(screen.getByText("dashboard.title")).toBeInTheDocument();
    expect(screen.getByText("dashboard.welcome")).toBeInTheDocument();

    // Wait for daily stats to avoid act warning
    await waitFor(() => {
      expect(screen.getByText("+10 / -5")).toBeInTheDocument();
    });
  });

  it("calculates and displays stats correctly", async () => {
    render(<Dashboard />);

    // Total Items: 3
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("dashboard.totalItems")).toBeInTheDocument();

    // Low Stock Items: 1 (Item 2 has stock 2, threshold 5)
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("dashboard.lowStockItems")).toBeInTheDocument();

    // Top Category: Cat1 (2 items) vs Cat2 (1 item)
    expect(screen.getByText("Cat1")).toBeInTheDocument();
    expect(screen.getByText("dashboard.topCategory")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("+10 / -5")).toBeInTheDocument();
    });
  });

  it("fetches and displays daily stats", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/activity/dashboard-stats",
        expect.any(Object)
      );

      // Display format: "+10 / -5"
      expect(screen.getByText("+10 / -5")).toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    const error = new Error("Failed to fetch");
    mockFetch.mockRejectedValueOnce(error);

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(
        error,
        "errors.loadDashboard"
      );
    });
  });

  it("renders child components", async () => {
    render(<Dashboard />);

    expect(screen.getByTestId("stock-health")).toBeInTheDocument();
    expect(screen.getAllByTestId("quick-actions")[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("+10 / -5")).toBeInTheDocument();
    });
  });
});
