/* eslint-disable react-x/no-unnecessary-use-prefix */
import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const t = (k: string) => k;
  const translation = { t, lang: "en" };
  const searchParams = [new URLSearchParams(), vi.fn()] as const;
  const handleError = vi.fn();
  const errorHandler = { handleError };

  return {
    i18n: {
      useTranslation: () => translation,
    },
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    },
    errorHandler: {
      useErrorHandler: () => errorHandler,
    },
    router: {
      useSearchParams: () => searchParams,
    },
  };
});

vi.mock("@/i18n", () => mocks.i18n);
vi.mock("@/supabaseClient", () => ({ supabase: mocks.supabase }));
vi.mock("../useErrorHandler", () => mocks.errorHandler);
vi.mock("react-router-dom", () => ({
  useSearchParams: mocks.router.useSearchParams,
}));

import type { Appliance } from "@/types/appliances";

import { useApplianceManagement } from "../useApplianceManagement";

describe("useApplianceManagement - State & Fetching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch appliances on mount", async () => {
    const mockAppliances = [{ id: "1", name: "Fridge", status: "functional" }];
    // Ensure the chain returns a promise that resolves
    mocks.supabase.order.mockResolvedValueOnce({
      data: mockAppliances,
      error: null,
    });

    const { result } = renderHook(() => useApplianceManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mocks.supabase.from).toHaveBeenCalledWith("appliances");
    expect(result.current.appliances).toEqual(mockAppliances);
  });

  it("should filter appliances by status", async () => {
    const mockAppliances = [
      { id: "1", name: "Fridge", status: "functional" },
      { id: "2", name: "Oven", status: "broken" },
    ];
    mocks.supabase.order.mockResolvedValueOnce({
      data: mockAppliances,
      error: null,
    });

    const { result } = renderHook(() => useApplianceManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setFilter("functional");
    });

    expect(result.current.filteredAppliances).toHaveLength(1);
    expect(result.current.filteredAppliances[0].id).toBe("1");
  });

  it("should handle toggle item selection", () => {
    const { result } = renderHook(() => useApplianceManagement());

    act(() => {
      result.current.actions.toggleItem("1", true);
    });
    expect(result.current.selectedItems.has("1")).toBe(true);

    act(() => {
      result.current.actions.toggleItem("1", false);
    });
    expect(result.current.selectedItems.has("1")).toBe(false);
  });

  it("should toggle all appliances", () => {
    const mockAppliances = [
      { id: "1", name: "Fridge", status: "functional" },
      { id: "2", name: "Oven", status: "broken" },
    ];
    const { result } = renderHook(() => useApplianceManagement());

    act(() => {
      result.current.actions.toggleAll(
        true,
        mockAppliances as unknown as Appliance[]
      );
    });
    expect(result.current.selectedItems.size).toBe(2);

    act(() => {
      result.current.actions.toggleAll(
        false,
        mockAppliances as unknown as Appliance[]
      );
    });
    expect(result.current.selectedItems.size).toBe(0);
  });
});
