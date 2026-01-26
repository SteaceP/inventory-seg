/* eslint-disable @typescript-eslint/unbound-method */
import { renderHook, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useInventoryActions } from "../useInventoryActions";
import { supabase } from "../../../supabaseClient";
import * as ActivityUtils from "../../../utils/activityUtils";

import type { InventoryItem } from "../../../types/inventory";

// Mock Supabase
vi.mock("../../../supabaseClient", () => {
  const mockUpload = vi.fn();
  const mockGetPublicUrl = vi.fn();
  const mockUpdate = vi.fn();
  const mockInsert = vi.fn();
  const mockDelete = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();

  // Chainable mocks
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
  // mockInsert returns select().single() chain
  const mockSingle = vi.fn();
  const mockSelectChain = vi.fn(() => ({ single: mockSingle }));
  mockInsert.mockReturnValue({ select: mockSelectChain });

  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
        getSession: vi.fn(),
      },
      storage: {
        from: vi.fn(() => ({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        })),
      },
      from: vi.fn(() => ({
        update: mockUpdate,
        insert: mockInsert,
        delete: mockDelete,
        select: mockSelect,
      })),
    },
  };
});

// Mock Contexts and Hooks
const mockShowError = vi.fn();
const mockHandleError = vi.fn();
const mockRefreshInventory = vi.fn();
const mockUpdateCategoryThreshold = vi.fn();
const mockBroadcastInventoryChange = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock("../../../contexts/AlertContext", () => ({
  useAlert: () => ({ showError: mockShowError }),
}));

vi.mock("../../useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: mockHandleError }),
}));

vi.mock("../../../i18n", () => ({
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

vi.mock("../../../contexts/InventoryContext", () => ({
  useInventoryContext: () => ({
    items: mockItems,
    categories: mockCategories,
    refreshInventory: mockRefreshInventory,
    updateCategoryThreshold: mockUpdateCategoryThreshold,
    broadcastInventoryChange: mockBroadcastInventoryChange,
  }),
}));

vi.mock("../../../contexts/UserContext", () => ({
  useUserContext: () => ({
    role: "admin",
    lowStockThreshold: 10,
  }),
}));

// Mock Utils
vi.mock("../../../utils/activityUtils", () => ({
  logActivity: vi.fn(),
}));

vi.mock("../../../utils/crypto", () => ({
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
    global.fetch = vi.fn();

    // Default Supabase Auth Mocks
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "u1", email: "test@example.com" } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "token" } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle handleImageUpload success", async () => {
    const { result } = renderHook(() => useInventoryActions(defaultProps));

    // Setup Storage Mock
    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    const mockGetPublicUrl = vi
      .fn()
      .mockReturnValue({ data: { publicUrl: "http://url.com" } });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const file = new File(["content"], "test.png", { type: "image/png" });
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleImageUpload(event);
    });

    expect(mockUpload).toHaveBeenCalled();
    expect(mockSetFormData).toHaveBeenCalled(); // Should update with new URL
    // Actually setFormData is called with a callback closure, hard to check exact arg value without complex matcher
    // But we check it was called.
  });

  // Tests for handleStockSave
  it("should handleStockSave success", async () => {
    const { result } = renderHook(() => useInventoryActions(defaultProps));

    // Mock Update
    const mockUpdate = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Test for handleDeleteConfirm
  it("should delete item successfully", async () => {
    const { result } = renderHook(() => useInventoryActions(defaultProps));

    // Mock Delete chain
    const mockDelete = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Test for handleSave (Create)
  it("should create new item successfully", async () => {
    const { result } = renderHook(() =>
      useInventoryActions({
        ...defaultProps,
        formData: { name: "New Item", stock: 5 },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(ActivityUtils.logActivity).toHaveBeenCalled(); // Created activity
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  // Test for handleSave (Update)
  it("should update existing item successfully", async () => {
    const editingItem = mockItems[0];
    const { result } = renderHook(() =>
      useInventoryActions({
        ...defaultProps,
        editingItem: editingItem,
        formData: { ...editingItem, name: "Updated Name" },
      })
    );

    // Mock Update Chain
    const mockUpdate = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate,
      delete: vi.fn().mockReturnValue({ eq: vi.fn() }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Updated Name" })
    );
    expect(ActivityUtils.logActivity).toHaveBeenCalled(); // Updated activity
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});
