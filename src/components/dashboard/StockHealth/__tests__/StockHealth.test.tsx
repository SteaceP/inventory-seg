/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { render, screen } from "@test/test-utils";
import { describe, it, expect, vi } from "vitest";
import StockHealth from "../StockHealth";
import type { InventoryItem, InventoryCategory } from "@/types/inventory";

// Use vi.hoisted to ensure these are available in mock factory
const { mockItems, mockCategories, mockUserContextValue, UserContextMock } =
  vi.hoisted(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    const initialValue = { lowStockThreshold: 5, language: "fr" };
    const ctx = React.createContext(initialValue);
    return {
      mockItems: { current: [] as Partial<InventoryItem>[] },
      mockCategories: { current: [] as Partial<InventoryCategory>[] },
      mockUserContextValue: { current: initialValue },
      UserContextMock: ctx,
    };
  });

// Mock i18n
vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    items: mockItems.current as InventoryItem[],
    categories: mockCategories.current as InventoryCategory[],
    presence: {},
  }),
}));

vi.mock("@contexts/UserContext", () => ({
  UserContext: UserContextMock,
  useUserContext: () => mockUserContextValue.current,
}));

describe("StockHealth", () => {
  it("should render 100% when no items", () => {
    mockItems.current = [];
    render(<StockHealth />);

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("dashboard.health.excellent")).toBeInTheDocument();
  });

  it("should calculate health based on global threshold", () => {
    mockItems.current = [
      { id: "1", stock: 10, category: "Tools" }, // OK
      { id: "2", stock: 2, category: "Tools" }, // Low (thresh 5)
    ];
    mockCategories.current = [];
    mockUserContextValue.current.lowStockThreshold = 5;

    render(<StockHealth />);

    // 1 issue out of 2 items = 50% healthy
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("dashboard.health.critical")).toBeInTheDocument();
  });

  it("should respect category and item thresholds", () => {
    mockItems.current = [
      { id: "1", stock: 8, category: "Tools", low_stock_threshold: null }, // Low (cat thresh 10)
      { id: "2", stock: 4, category: "Electronics", low_stock_threshold: 2 }, // OK (item thresh 2)
      { id: "3", stock: 3, category: "Hardware", low_stock_threshold: null }, // Low (global thresh 5)
      { id: "4", stock: 10, category: "Hardware", low_stock_threshold: null }, // OK
    ];
    mockCategories.current = [
      {
        name: "Tools",
        low_stock_threshold: 10,
        created_at: "",
        updated_at: "",
      },
      {
        name: "Electronics",
        low_stock_threshold: 15,
        created_at: "",
        updated_at: "",
      },
    ] as InventoryCategory[];
    mockUserContextValue.current.lowStockThreshold = 5;

    render(<StockHealth />);

    // 2 issues / 4 items = 50% healthy
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
