/* eslint-disable react-x/no-unnecessary-use-prefix */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

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

import { useApplianceManagement } from "../useApplianceManagement";
import type { Appliance } from "@/types/appliances";

describe("useApplianceManagement - Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle create appliance", async () => {
    mocks.supabase.insert.mockResolvedValueOnce({ error: null });
    mocks.supabase.order.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useApplianceManagement());

    await act(async () => {
      await result.current.actions.handleCreateAppliance({
        name: "New Fridge",
      });
    });

    expect(mocks.supabase.from).toHaveBeenCalledWith("appliances");
    expect(mocks.supabase.insert).toHaveBeenCalled();
    expect(result.current.dialogs.openAddAppliance).toBe(false);
  });

  it("should handle update appliance", async () => {
    const mockAppliance = { id: "1", name: "Fridge" };
    mocks.supabase.update.mockResolvedValueOnce({ error: null });
    mocks.supabase.order.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useApplianceManagement());

    act(() => {
      result.current.setSelectedAppliance(
        mockAppliance as unknown as Appliance
      );
    });

    await act(async () => {
      await result.current.actions.handleUpdateAppliance({
        name: "Updated Fridge",
      });
    });

    expect(mocks.supabase.update).toHaveBeenCalled();
    expect(result.current.dialogs.openEditAppliance).toBe(false);
  });

  it("should handle delete appliance", async () => {
    mocks.supabase.delete.mockReturnThis();
    mocks.supabase.eq.mockResolvedValueOnce({ error: null });
    mocks.supabase.order.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useApplianceManagement());

    act(() => {
      result.current.actions.handleDeleteClick("1");
    });
    expect(result.current.dialogs.deleteConfirmOpen).toBe(true);

    await act(async () => {
      await result.current.actions.handleDeleteConfirm();
    });

    expect(mocks.supabase.delete).toHaveBeenCalled();
    expect(result.current.dialogs.deleteConfirmOpen).toBe(false);
  });

  it("should handle create repair", async () => {
    const mockAppliance = { id: "1", name: "Fridge" };
    mocks.supabase.insert.mockResolvedValueOnce({ error: null });
    mocks.supabase.order.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useApplianceManagement());

    act(() => {
      result.current.setSelectedAppliance(
        mockAppliance as unknown as Appliance
      );
    });

    await act(async () => {
      await result.current.actions.handleCreateRepair({
        description: "Fixed door",
      });
    });

    expect(mocks.supabase.from).toHaveBeenCalledWith("repairs");
    expect(result.current.dialogs.openAddRepair).toBe(false);
  });
});
