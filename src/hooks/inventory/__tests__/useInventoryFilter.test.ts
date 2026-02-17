import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { InventoryItem, InventoryCategory } from "@/types/inventory";

import { useInventoryFilter } from "../useInventoryFilter";

// Mock React Router
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn(
  (
    params: URLSearchParams | { [key: string]: string } | { filter: string }
  ) => {
    // Basic mock behavior
    if ("filter" in params && typeof params.filter === "string") {
      mockSearchParams.set("filter", params.filter);
    } else if (params instanceof URLSearchParams) {
      // replace
    } else {
      // object
      Object.entries(params).forEach(([k, v]) => {
        mockSearchParams.set(k, v);
      });
    }
  }
);

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

const mockItems = [
  {
    id: "1",
    name: "Apple",
    category: "Fruit",
    stock: 10,
    low_stock_threshold: 15,
    sku: "111",
    unit_cost: 1,
    image_url: "",
    user_id: "u1",
  },
  {
    id: "2",
    name: "Banana",
    category: "Fruit",
    stock: 20,
    low_stock_threshold: null,
    sku: "222",
    unit_cost: 1,
    image_url: "",
    user_id: "u1",
  },
  {
    id: "3",
    name: "Carrot",
    category: "Veg",
    stock: 2,
    low_stock_threshold: null,
    sku: "333",
    unit_cost: 1,
    image_url: "",
    user_id: "u1",
  },
  {
    id: "4",
    name: "Empty Box",
    category: "Misc",
    stock: 0,
    low_stock_threshold: null,
    sku: "444",
    unit_cost: 1,
    image_url: "",
    user_id: "u1",
  },
] as unknown as InventoryItem[];

const mockCategories = [
  { name: "Fruit", low_stock_threshold: 5 },
  { name: "Veg", low_stock_threshold: null },
] as unknown as InventoryCategory[];

const globalThreshold = 3;

describe("useInventoryFilter", () => {
  beforeEach(() => {
    mockSearchParams.delete("filter");
    mockSetSearchParams.mockClear();
  });

  it("should return all items initially", () => {
    const { result } = renderHook(() =>
      useInventoryFilter({
        items: mockItems,
        categories: mockCategories,
        globalThreshold,
      })
    );

    expect(result.current.filteredItems).toHaveLength(4);
  });

  it("should filter by search query (name)", () => {
    const { result } = renderHook(() =>
      useInventoryFilter({
        items: mockItems,
        categories: mockCategories,
        globalThreshold,
      })
    );

    act(() => {
      result.current.setSearchQuery("apple");
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe("Apple");
  });

  it("should filter by search query (sku)", () => {
    const { result } = renderHook(() =>
      useInventoryFilter({
        items: mockItems,
        categories: mockCategories,
        globalThreshold,
      })
    );

    act(() => {
      result.current.setSearchQuery("222");
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe("Banana");
  });

  it("should filter by category", () => {
    const { result } = renderHook(() =>
      useInventoryFilter({
        items: mockItems,
        categories: mockCategories,
        globalThreshold,
      })
    );

    act(() => {
      result.current.setSelectedCategory("Fruit");
    });

    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.filteredItems.map((i) => i.name)).toEqual(
      expect.arrayContaining(["Apple", "Banana"])
    );
  });

  it("should filter by low stock (hierarchy test)", () => {
    // Set URL param manually before rendering
    mockSearchParams.set("filter", "lowStock");

    const { result } = renderHook(() =>
      useInventoryFilter({
        items: mockItems,
        categories: mockCategories,
        globalThreshold,
      })
    );

    expect(result.current.isLowStockFilter).toBe(true);

    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.filteredItems.map((i) => i.name)).toEqual(
      expect.arrayContaining(["Apple", "Carrot"])
    );
  });

  it("should filter by out of stock via URL", () => {
    mockSearchParams.set("filter", "outOfStock");

    const { result } = renderHook(() =>
      useInventoryFilter({
        items: mockItems,
        categories: mockCategories,
        globalThreshold,
      })
    );

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe("Empty Box");
  });
});
