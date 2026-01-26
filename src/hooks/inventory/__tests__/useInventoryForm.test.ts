import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useInventoryForm } from "../useInventoryForm";
import type { InventoryItem } from "../../../types/inventory";

// Mock crypto utils
vi.mock("../../../utils/crypto", () => ({
  generateSecureId: vi.fn(() => "TEST-SKU"),
  generateSecureFileName: vi.fn(),
  validateImageFile: vi.fn(),
  getExtensionFromMimeType: vi.fn(),
}));

describe("useInventoryForm", () => {
  const mockSetEditingId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with closed state", () => {
    const { result } = renderHook(() => useInventoryForm());
    expect(result.current.open).toBe(false);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.formData.name).toBe("");
  });

  it("should open form with empty data for new item", () => {
    const { result } = renderHook(() => useInventoryForm());

    act(() => {
      result.current.handleOpen();
    });

    expect(result.current.open).toBe(true);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.formData).toMatchObject({
      name: "",
      category: "",
      sku: "",
      stock: 0,
    });
  });

  it("should open form with item data for editing via handleOpen", () => {
    const { result } = renderHook(() => useInventoryForm());
    const item: InventoryItem = {
      id: "1",
      name: "Test Item",
      category: "Test Cat",
      sku: "SKU-1",
      stock: 10,
      image_url: "url",
      low_stock_threshold: 5,
      notes: "notes",
      created_at: "date",
      location: null,
      unit_cost: 0,
    };

    act(() => {
      result.current.handleOpen(item);
    });

    expect(result.current.open).toBe(true);
    expect(result.current.editingItem).toBe(item);
    expect(result.current.formData).toBe(item);
  });

  it("should handle handleEdit and update parent state", () => {
    const { result } = renderHook(() => useInventoryForm(mockSetEditingId));
    const item: InventoryItem = {
      id: "1",
      name: "Test Item",
      category: "Test Cat",
      sku: "SKU-1",
      stock: 10,
      image_url: "",
      low_stock_threshold: null,
      notes: "",
      created_at: "date",
      location: null,
      unit_cost: 0,
    };

    act(() => {
      result.current.handleEdit(item);
    });

    expect(result.current.open).toBe(true);
    expect(result.current.editingItem).toBe(item);
    expect(result.current.formData).toBe(item);
    expect(mockSetEditingId).toHaveBeenCalledWith("1");
  });

  it("should generate SKU", () => {
    const { result } = renderHook(() => useInventoryForm());

    act(() => {
      result.current.generateSKU();
    });

    expect(result.current.formData.sku).toBe("TEST-SKU");
  });

  it("should close form and reset parent state", () => {
    const { result } = renderHook(() => useInventoryForm(mockSetEditingId));

    act(() => {
      result.current.setOpen(true);
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.open).toBe(false);
    expect(mockSetEditingId).toHaveBeenCalledWith(null);
  });
});
