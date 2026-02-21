/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { renderHook, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { supabase } from "@/supabaseClient";
import type { InventoryItem } from "@/types/inventory";

import { mockSupabaseClient } from "@test/mocks";
import * as ActivityUtils from "@utils/activityUtils";

import { useInventoryActions } from "../useInventoryActions";

// Mock Supabase
// Supabase mock is handled globally in src/test/setup.ts

// Mock Contexts and Hooks
const mockShowError = vi.fn();
const mockShowSuccess = vi.fn();
const mockHandleError = vi.fn();
const mockRefreshInventory = vi.fn();
const mockUpdateCategoryThreshold = vi.fn();
const mockBroadcastInventoryChange = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock("@contexts/AlertContext", () => ({
  useAlert: () => ({ showError: mockShowError, showSuccess: mockShowSuccess }),
}));

vi.mock("../../useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: mockHandleError }),
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({ t: mockT }),
}));

// Default mock values for contexts
const mockItems: InventoryItem[] = [
  {
    id: "1",
    name: "Item 1",
    category: "Cat 1",
    sku: "SKU-1",
    stock: 10,
    image_url: "",
    low_stock_threshold: 5,
    created_at: "date",
    notes: "",
    location: null,
    unit_cost: 0,
  },
];
const mockCategories = [{ name: "Cat 1", low_stock_threshold: 5 }];

vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    items: mockItems,
    categories: mockCategories,
    refreshInventory: mockRefreshInventory,
    updateCategoryThreshold: mockUpdateCategoryThreshold,
    broadcastInventoryChange: mockBroadcastInventoryChange,
  }),
}));

vi.mock("@contexts/UserContextDefinition", () => ({
  useUserContext: () => ({
    role: "admin",
    lowStockThreshold: 10,
  }),
}));

// Mock Utils
vi.mock("@utils/activityUtils", () => ({
  logActivity: vi.fn(),
}));

vi.mock("@utils/crypto", () => ({
  validateImageFile: vi.fn(),
  generateSecureFileName: vi.fn(() => "secure-file.jpg"),
  getExtensionFromMimeType: vi.fn(() => "jpg"),
}));

describe("useInventoryActions", () => {
  const mockSetFormData = vi.fn();
  const mockSetOpen = vi.fn();
  const mockSetEditingId = vi.fn();

  const defaultProps = {
    formData: {},
    setFormData: mockSetFormData,
    editingItem: null,
    setOpen: mockSetOpen,
    setEditingId: mockSetEditingId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;

    // Default Supabase Auth Mocks
    mockSupabaseClient.helpers.setAuthUser({
      id: "u1",
      email: "test@example.com",
    });
    mockSupabaseClient.helpers.setAuthSession({ access_token: "token" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle handleImageUpload success", async () => {
    const { result } = renderHook(() => useInventoryActions(defaultProps));

    // Setup Fetch Mock for Worker Upload
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "http://url.com" }),
    } as Response);

    const file = new File(["content"], "test.png", { type: "image/png" });
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleImageUpload(event);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/storage/upload"),
      expect.any(Object)
    );
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should handleStockSave success", async () => {
    const { result } = renderHook(() => useInventoryActions(defaultProps));

    // Mock Update
    const mockUpdate = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any);

    await act(async () => {
      const success = await result.current.handleStockSave("1", 20);
      expect(success).toBe(true);
    });

    expect(mockUpdate).toHaveBeenCalled();
    expect(ActivityUtils.logActivity).toHaveBeenCalled();
    expect(mockRefreshInventory).toHaveBeenCalled();
    expect(mockBroadcastInventoryChange).toHaveBeenCalled();
  });

  it("should delete item successfully", async () => {
    const { result } = renderHook(() => useInventoryActions(defaultProps));

    // Mock Delete chain
    const mockDelete = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any);

    act(() => {
      result.current.handleDeleteClick("1");
    });
    expect(result.current.deleteConfirmOpen).toBe(true);

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(mockDelete).toHaveBeenCalled();
    expect(ActivityUtils.logActivity).toHaveBeenCalled();
    expect(result.current.deleteConfirmOpen).toBe(false);
  });

  it("should create new item successfully", async () => {
    const { result } = renderHook(() =>
      useInventoryActions({
        ...defaultProps,
        formData: {
          name: "New Item",
          stock: 5,
          stock_locations: [{ location: "Warehouse 1", quantity: 5 }],
        },
      })
    );

    // Mock Insert Chain
    const mockSelectChain = {
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: "new-id" }, error: null }),
    };
    const mockInsert = vi
      .fn()
      .mockReturnValue({ select: vi.fn().mockReturnValue(mockSelectChain) });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(ActivityUtils.logActivity).toHaveBeenCalled();
    expect(mockSetOpen).toHaveBeenCalledWith(false);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining("inventory.success.save")
    );
  });

  it("should show error and return early if no stock location provided on save", async () => {
    const { result } = renderHook(() =>
      useInventoryActions({
        ...defaultProps,
        formData: { name: "No Location Item", stock: 5 }, // no locations
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining("inventory.locationRequired")
    );
    // Should return early
    expect(supabase.from).not.toHaveBeenCalled();
    expect(mockSetOpen).not.toHaveBeenCalled();
    expect(mockShowSuccess).not.toHaveBeenCalled();
  });

  it("should update existing item successfully", async () => {
    const editingItem = mockItems[0];
    const { result } = renderHook(() =>
      useInventoryActions({
        ...defaultProps,
        editingItem: editingItem,
        formData: {
          ...editingItem,
          name: "Updated Name",
          stock_locations: [{ location: "Warehouse 1", quantity: 10 }],
        },
      })
    );

    // Mock Update Chain
    const mockUpdate = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    const mockDelete = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
      delete: mockDelete,
      insert: mockInsert,
    } as any);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Updated Name" })
    );
    expect(ActivityUtils.logActivity).toHaveBeenCalled();
    expect(mockSetOpen).toHaveBeenCalledWith(false);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining("inventory.success.save")
    );
  });

  it("should update existing item with stock locations successfully", async () => {
    const editingItem = mockItems[0];
    const stockLocations = [
      {
        id: "loc-1",
        inventory_id: editingItem.id,
        location: "Warehouse A",
        quantity: 8,
        parent_location: null,
      },
    ];
    const { result } = renderHook(() =>
      useInventoryActions({
        ...defaultProps,
        editingItem: editingItem,
        formData: {
          ...editingItem,
          stock: 8,
          stock_locations: stockLocations,
        },
      })
    );

    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
      delete: mockDelete,
      insert: mockInsert,
    } as any);

    await act(async () => {
      await result.current.handleSave();
    });

    // Verify stock locations were deleted and re-inserted
    expect(mockDelete).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          inventory_id: editingItem.id,
          location: "Warehouse A",
          quantity: 8,
        }),
      ])
    );
    expect(mockSetOpen).toHaveBeenCalledWith(false);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining("inventory.success.save")
    );
  });

  it("should show error when stock location insert fails during edit", async () => {
    const editingItem = mockItems[0];
    const stockLocations = [
      {
        id: "loc-1",
        inventory_id: editingItem.id,
        location: "Warehouse A",
        quantity: 5,
        parent_location: null,
      },
    ];
    const { result } = renderHook(() =>
      useInventoryActions({
        ...defaultProps,
        editingItem: editingItem,
        formData: {
          ...editingItem,
          stock: 5,
          stock_locations: stockLocations,
        },
      })
    );

    const insertError = { message: "RLS policy violation", code: "42501" };
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: insertError });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
      delete: mockDelete,
      insert: mockInsert,
    } as any);

    await act(async () => {
      await result.current.handleSave();
    });

    // Verify error was surfaced to user
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining("RLS policy violation")
    );
    // Dialog should NOT close on error
    expect(mockSetOpen).not.toHaveBeenCalledWith(false);
  });
});
