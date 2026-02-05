import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  TestComponent,
  renderWithProvider,
  mocks,
  mockItems,
  mockCategories,
  mockLocations,
} from "./InventoryContext.test-utils";

describe("InventoryContext - Fetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset default success behavior
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
      } else if (table === "inventory_categories") {
        queryBuilder.select.mockResolvedValue({
          data: mockCategories,
          error: null,
        });
      } else if (table === "inventory_locations") {
        queryBuilder.select.mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockLocations,
            error: null,
          }),
        });
      }

      return queryBuilder;
    });

    // Default chain returns for select
    mocks.supabase.select.mockReturnValue({
      order: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
      }),
    });

    // Mock Navigator
    Object.defineProperty(window, "navigator", {
      value: { onLine: true },
      configurable: true,
      writable: true,
    });
  });

  it("should fetch all inventory data on mount", async () => {
    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("item-count")).toHaveTextContent("2");

    expect(mocks.supabase.from).toHaveBeenCalledWith("inventory");
    expect(mocks.supabase.from).toHaveBeenCalledWith("inventory_categories");
    expect(mocks.supabase.from).toHaveBeenCalledWith("inventory_locations");
  });

  it("should handle fetch error", async () => {
    // Force error on inventory fetch
    mocks.supabase.from.mockImplementation((table: string) => {
      if (table === "inventory") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Fetch failed" },
              }),
            }),
          }),
          insert: mocks.supabase.insert,
          update: mocks.supabase.update,
          delete: mocks.supabase.delete,
          upsert: mocks.supabase.upsert,
        };
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: mocks.supabase.insert,
        update: mocks.supabase.update,
        delete: mocks.supabase.delete,
        upsert: mocks.supabase.upsert,
      };
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      // The component displays the error.message or error string
      expect(
        screen.getByText(/Fetch failed|errors.loadInventory/)
      ).toBeInTheDocument();
    });

    expect(mocks.alert.showError).toHaveBeenCalledWith(
      expect.stringContaining("Fetch failed")
    );
  });
});
