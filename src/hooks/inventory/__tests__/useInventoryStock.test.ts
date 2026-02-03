import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { mockSupabaseClient } from "@test/mocks/supabase";
import {
  createMockAlertContext,
  createMockInventoryContext,
  createMockUserContext,
} from "@test/mocks/contexts";

// Mock contexts
const mockAlert = createMockAlertContext();
const mockInventory = createMockInventoryContext({
  items: [
    {
      id: "item-1",
      name: "Test Item",
      stock: 10,
      category: "Test",
    } as unknown as InventoryItem,
  ],
});
const mockUser = createMockUserContext();

vi.mock("@contexts/AlertContext", () => ({ useAlert: () => mockAlert }));
vi.mock("@contexts/InventoryContext", () => ({
  useInventoryContext: () => mockInventory,
}));
vi.mock("@contexts/UserContext", () => ({ useUserContext: () => mockUser }));

// Mock utils
vi.mock("@utils/activityUtils", () => ({
  logActivity: vi.fn(),
}));

vi.mock("../useErrorHandler", () => ({
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn(),
  })),
}));

// Setup i18n mock
vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    lang: "en",
  }),
}));

// Mock supabaseClient
vi.mock("@/supabaseClient", () => ({
  supabase: mockSupabaseClient.client,
}));

// Mock fetch
const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal("fetch", mockFetch);

// Import hook after mocks
import { useInventoryStock } from "../useInventoryStock";
import type { InventoryItem } from "@/types/inventory";

describe("useInventoryStock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle stock save successfully", async () => {
    const { result } = renderHook(() => useInventoryStock());

    mockSupabaseClient.helpers.setAuthUser({
      id: "user-1",
      email: "test@example.com",
    });
    mockSupabaseClient.helpers.setAuthSession({ access_token: "token" });
    mockSupabaseClient.mocks.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const success = await act(async () => {
      return await result.current.handleStockSave("item-1", 15);
    });

    expect(success).toBe(true);
    expect(mockSupabaseClient.mocks.update).toHaveBeenCalled();
    expect(mockInventory.refreshInventory).toHaveBeenCalled();
    expect(mockInventory.broadcastInventoryChange).toHaveBeenCalled();
  });

  it("should handle stock save error", async () => {
    const { result } = renderHook(() => useInventoryStock());

    mockSupabaseClient.mocks.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: new Error("Update failed") }),
    });

    const success = await act(async () => {
      return await result.current.handleStockSave("item-1", 15);
    });

    expect(success).toBe(false);
    expect(mockAlert.showError).toHaveBeenCalled();
  });

  it("should check low stock and notify", async () => {
    const { result } = renderHook(() => useInventoryStock());

    mockSupabaseClient.helpers.setAuthUser({
      id: "user-1",
      email: "test@example.com",
    });
    mockSupabaseClient.helpers.setAuthSession({ access_token: "token" });

    // item stock 5, threshold 10 (from user context)
    await act(async () => {
      await result.current.checkLowStockAndNotify({
        id: "item-1",
        name: "Test Item",
        stock: 5,
      });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/send-low-stock-alert",
      expect.any(Object)
    );
  });
});
