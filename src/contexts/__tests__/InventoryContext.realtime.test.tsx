import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import {
  TestComponent,
  renderWithProvider,
  mocks,
  mockItems,
} from "./InventoryContext.test-utils";

describe("InventoryContext - Realtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset default success behavior for data fetching
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

    mocks.supabase.subscribe.mockImplementation(function (
      this: Record<string, unknown>,
      callback: (status: string) => void
    ) {
      if (typeof callback === "function") {
        // Immediately trigger SUBSCRIBED to simulate successful connection
        callback("SUBSCRIBED");
      }
      return this;
    });

    mocks.supabase.channel.mockReturnValue({
      on: mocks.supabase.on,
      subscribe: mocks.supabase.subscribe,
      unsubscribe: mocks.supabase.unsubscribe,
      track: mocks.supabase.track,
      send: mocks.supabase.send,
      presenceState: mocks.supabase.presenceState,
    });
  });

  it("should setup presence channel", async () => {
    renderWithProvider(<TestComponent />);

    await waitFor(() =>
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    );

    expect(mocks.supabase.channel).toHaveBeenCalledWith(
      "inventory-sync",
      expect.any(Object)
    );
    expect(mocks.supabase.on).toHaveBeenCalledWith(
      "presence",
      { event: "sync" },
      expect.any(Function)
    );

    expect(mocks.supabase.track).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "test-user-123",
        displayName: "Test User",
      })
    );
  });

  it("should broadcast inventory changes", async () => {
    renderWithProvider(<TestComponent />);

    await waitFor(() =>
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    );

    const btn = screen.getByTestId("broadcast-btn");
    act(() => {
      btn.click();
    });

    expect(mocks.supabase.send).toHaveBeenCalledWith({
      type: "broadcast",
      event: "inventory-updated",
      payload: expect.any(Object) as unknown,
    });
  });

  it("should update presence when editing an item", async () => {
    renderWithProvider(<TestComponent />);

    await waitFor(() =>
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    );

    // Initial track from mount
    expect(mocks.supabase.track).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "test-user-123", editingId: null })
    );

    mocks.supabase.track.mockClear();

    // Click edit
    const btn = screen.getByTestId("edit-btn");
    act(() => {
      btn.click();
    });

    await waitFor(() => {
      // We expect track to be called again with new status (editing item 1)
      expect(mocks.supabase.track).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "test-user-123",
          editingId: "1",
        })
      );
    });
  });
});
