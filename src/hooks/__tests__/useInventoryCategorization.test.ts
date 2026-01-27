import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInventoryCategorization } from "../useInventoryCategorization";
import type { InventoryItem } from "@/types/inventory";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createItem = (
  id: string,
  name: string,
  category: string | null
): InventoryItem =>
  ({
    id,
    name,
    category: category as string,
    sku: `SKU-${id}`,
    stock: 10,
    unit_cost: 5,
    image_url: null,
    low_stock_threshold: null,
    notes: null,
    created_at: "2023-01-01",
    location: null,
  }) as InventoryItem;

describe("useInventoryCategorization", () => {
  it("groups items by category", () => {
    const items = [
      createItem("1", "Item A1", "Category A"),
      createItem("2", "Item B1", "Category B"),
      createItem("3", "Item A2", "Category A"),
      createItem("4", "Item U1", null),
    ];

    const { result } = renderHook(() => useInventoryCategorization(items));

    expect(result.current.sortedCategories).toEqual([
      "Category A",
      "Category B",
      "inventory.uncategorized",
    ]);
    expect(result.current.groupedItems["Category A"]).toHaveLength(2);
    expect(result.current.groupedItems["Category B"]).toHaveLength(1);
    expect(result.current.groupedItems["inventory.uncategorized"]).toHaveLength(
      1
    );
  });

  it("toggles category collapse state", () => {
    const items = [createItem("1", "Item 1", "Category A")];
    const { result } = renderHook(() => useInventoryCategorization(items));

    // Initially all categories are in collapsedCategories set
    expect(result.current.collapsedCategories.has("Category A")).toBe(true);

    act(() => {
      result.current.toggleCategory("Category A");
    });

    expect(result.current.collapsedCategories.has("Category A")).toBe(false);

    act(() => {
      result.current.toggleCategory("Category A");
    });

    expect(result.current.collapsedCategories.has("Category A")).toBe(true);
  });
});
