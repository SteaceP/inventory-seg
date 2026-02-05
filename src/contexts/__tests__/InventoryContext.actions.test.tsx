import { screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  TestComponent,
  renderWithProvider,
  mocks,
  mockItems,
} from "./InventoryContext.test-utils";

describe("InventoryContext - Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default success for upsert
    mocks.supabase.upsert.mockResolvedValue({ error: null });

    // Default select chain mock
    mocks.supabase.from.mockImplementation((table: string) => {
      const queryBuilder = {
        select: vi.fn(),
        upsert: mocks.supabase.upsert,
        insert: mocks.supabase.insert,
        update: mocks.supabase.update,
        delete: mocks.supabase.delete,
      };

      if (table === "inventory") {
        queryBuilder.select.mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
          }),
        });
      } else {
        queryBuilder.select.mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        });
      }
      return queryBuilder;
    });
  });

  it("should update category threshold", async () => {
    renderWithProvider(<TestComponent />);

    await waitFor(() =>
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    );

    const btn = screen.getByTestId("update-threshold-btn");
    act(() => {
      btn.click();
    });

    await waitFor(() => {
      expect(mocks.supabase.upsert).toHaveBeenCalledWith(
        { name: "Cat1", low_stock_threshold: 10 },
        { onConflict: "name" }
      );
    });

    // Ensure we are calling 'from' enough times (inventory load + update)
    expect(mocks.supabase.from).toHaveBeenCalledWith("inventory_categories");
  });
});
