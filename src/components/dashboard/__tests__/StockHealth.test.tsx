import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StockHealth from "../StockHealth";
import { ThemeProvider, createTheme } from "@mui/material";

import type {
  InventoryItem,
  InventoryCategory,
} from "../../../types/inventory";

// Mock data containers
const mockItems: { current: Partial<InventoryItem>[] } = { current: [] };
const mockCategories: { current: Partial<InventoryCategory>[] } = {
  current: [],
};
const mockUserContext = { lowStockThreshold: 5 };

vi.mock("../../../contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    items: mockItems.current as InventoryItem[],
    categories: mockCategories.current as InventoryCategory[],
  }),
}));

vi.mock("../../../contexts/UserContext", () => ({
  useUserContext: () => mockUserContext,
}));

vi.mock("../../../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const theme = createTheme();

describe("StockHealth", () => {
  it("should render 100% when no items", () => {
    mockItems.current = [];
    render(
      <ThemeProvider theme={theme}>
        <StockHealth />
      </ThemeProvider>
    );

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("dashboard.health.excellent")).toBeInTheDocument();
  });

  it("should calculate health based on global threshold", () => {
    mockItems.current = [
      { id: "1", stock: 10, category: "Tools" }, // OK
      { id: "2", stock: 2, category: "Tools" }, // Low (thresh 5)
    ];
    mockCategories.current = [];
    mockUserContext.lowStockThreshold = 5;

    render(
      <ThemeProvider theme={theme}>
        <StockHealth />
      </ThemeProvider>
    );

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
      { name: "Tools", low_stock_threshold: 10 },
      { name: "Electronics", low_stock_threshold: 15 },
    ];
    mockUserContext.lowStockThreshold = 5;

    render(
      <ThemeProvider theme={theme}>
        <StockHealth />
      </ThemeProvider>
    );

    // 2 issues / 4 items = 50% healthy
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("should show Excellent status when health > 80", () => {
    mockItems.current = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      stock: 20,
      category: "Tools",
    }));
    render(
      <ThemeProvider theme={theme}>
        <StockHealth />
      </ThemeProvider>
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("dashboard.health.excellent")).toBeInTheDocument();
  });

  it("should show Good status when health between 51 and 80", () => {
    mockItems.current = [
      { id: "1", stock: 10 },
      { id: "2", stock: 10 },
      { id: "3", stock: 10 },
      { id: "4", stock: 2 }, // Low
    ];
    mockUserContext.lowStockThreshold = 5;
    render(
      <ThemeProvider theme={theme}>
        <StockHealth />
      </ThemeProvider>
    );
    // 75%
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("dashboard.health.good")).toBeInTheDocument();
  });
});
