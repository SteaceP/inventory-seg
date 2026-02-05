/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { renderHook, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { supabase } from "@/supabaseClient";
import type { InventoryItem } from "@/types/inventory";

import * as ActivityUtils from "@utils/activityUtils";

import { useInventoryActions } from "../useInventoryActions";

// Mock Supabase
vi.mock("@supabaseClient", () => {
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

vi.mock("@contexts/AlertContext", () => ({
  useAlert: () => ({ showError: mockShowError }),
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

vi.mock("@contexts/UserContext", () => ({
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
    vi.mocked(supabase.auth.getUser).mockImplementation(
      async () => ({}) as any
    );
    vi.mocked(supabase.auth.getSession).mockImplementation(
      async () => ({}) as any
    );

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "u1", email: "test@example.com" } as any },
      error: null,
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "token" } as any },
      error: null,
    });
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

    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    } as any);

    const file = new File(["content"], "test.png", { type: "image/png" });
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleImageUpload(event);
    });

    expect(mockUpload).toHaveBeenCalled();
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
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(ActivityUtils.logActivity).toHaveBeenCalled();
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

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
    } as any);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Updated Name" })
    );
    expect(ActivityUtils.logActivity).toHaveBeenCalled();
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});
