import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { InventoryProvider, useInventoryContext } from "./InventoryContext";

// Hoist mocks
const mocks = vi.hoisted(() => {
  const showInfo = vi.fn();
  const showError = vi.fn();
  const userId = "test-user-123";
  const displayName = "Test User";

  // Supabase mocks
  const from = vi.fn();
  const select = vi.fn();
  const order = vi.fn();
  const upsert = vi.fn();
  const channel = vi.fn();
  const removeChannel = vi.fn();

  // Channel mocks
  const on = vi.fn().mockReturnThis();
  const subscribe = vi.fn();
  const unsubscribe = vi.fn();
  const track = vi.fn();
  const send = vi.fn();
  const presenceState = vi.fn().mockReturnValue({});

  return {
    showInfo,
    showError,
    userId,
    displayName,
    from,
    select,
    order,
    upsert,
    channel,
    removeChannel,
    on,
    subscribe,
    unsubscribe,
    track,
    send,
    presenceState,
  };
});

// Mock Dependencies
vi.mock("./AlertContext", () => ({
  useAlert: () => ({
    showInfo: mocks.showInfo,
    showError: mocks.showError,
  }),
}));

vi.mock("./UserContext", () => ({
  useUserContext: () => ({
    userId: mocks.userId,
    displayName: mocks.displayName,
  }),
}));

vi.mock("../i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../supabaseClient", () => ({
  supabase: {
    from: mocks.from,
    channel: mocks.channel,
    removeChannel: mocks.removeChannel,
  },
}));

// Mock Data
const mockItems = [
  { id: "1", name: "Item 1", category: "Cat1", stock: 10 },
  { id: "2", name: "Item 2", category: "Cat2", stock: 5 },
];
const mockCategories = [{ name: "Cat1", low_stock_threshold: 5 }];
const mockLocations = [{ id: "loc1", name: "Warehouse" }];

// Test Component
const TestComponent = () => {
  const {
    items,
    loading,
    error,
    updateCategoryThreshold,
    broadcastInventoryChange,
    setEditingId,
  } = useInventoryContext();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      <button
        data-testid="update-threshold-btn"
        onClick={() => void updateCategoryThreshold("Cat1", 10)}
      >
        Update Threshold
      </button>
      <button
        data-testid="broadcast-btn"
        onClick={() => broadcastInventoryChange()}
      >
        Broadcast
      </button>
      <button data-testid="edit-btn" onClick={() => setEditingId("1")}>
        Edit Item
      </button>
    </div>
  );
};

describe("InventoryContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset chainable channel mocks
    mocks.channel.mockReturnValue({
      on: mocks.on,
      subscribe: mocks.subscribe,
      unsubscribe: mocks.unsubscribe,
      track: mocks.track,
      send: mocks.send,
      presenceState: mocks.presenceState,
    });
    mocks.subscribe.mockReturnThis();

    // Mock Supabase Query Chains
    mocks.from.mockImplementation((table) => {
      const queryBuilder = {
        select: vi.fn(),
        upsert: mocks.upsert,
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

    mocks.upsert.mockResolvedValue({ error: null });

    // Mock Navigator
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<InventoryProvider>{ui}</InventoryProvider>);
  };

  it("should fetch all inventory data on mount", async () => {
    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("item-count")).toHaveTextContent("2");

    expect(mocks.from).toHaveBeenCalledWith("inventory");
    expect(mocks.from).toHaveBeenCalledWith("inventory_categories");
    expect(mocks.from).toHaveBeenCalledWith("inventory_locations");
  });

  it("should handle fetch error", async () => {
    // Force error on inventory fetch
    mocks.from.mockImplementation((table) => {
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
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error: errors.loadInventory/)
      ).toBeInTheDocument();
    });

    expect(mocks.showError).toHaveBeenCalledWith(
      expect.stringContaining("Fetch failed")
    );
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
      expect(mocks.upsert).toHaveBeenCalledWith(
        { name: "Cat1", low_stock_threshold: 10 },
        { onConflict: "name" }
      );
    });

    expect(mocks.from.mock.calls.length).toBeGreaterThan(3);
  });

  it("should setup presence channel", async () => {
    renderWithProvider(<TestComponent />);

    await waitFor(() =>
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    );

    expect(mocks.channel).toHaveBeenCalledWith(
      "inventory-sync",
      expect.any(Object)
    );
    expect(mocks.on).toHaveBeenCalledWith(
      "presence",
      { event: "sync" },
      expect.any(Function)
    );

    // Simulate subscribe callback 'SUBSCRIBED'
    const calls = mocks.subscribe.mock.calls as [unknown][];
    const syncSubCallback = calls.find((c) => typeof c[0] === "function")?.[0];
    if (typeof syncSubCallback === "function") {
      act(() => {
        (syncSubCallback as (status: string) => void)("SUBSCRIBED");
      });
    }

    expect(mocks.track).toHaveBeenCalledWith(
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

    expect(mocks.send).toHaveBeenCalledWith({
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

    const calls = mocks.subscribe.mock.calls as [unknown][];
    const syncSubCallback = calls.find((c) => typeof c[0] === "function")?.[0];
    if (typeof syncSubCallback === "function") {
      act(() => {
        (syncSubCallback as (status: string) => void)("SUBSCRIBED");
      });
    }
    mocks.track.mockClear();

    // Click edit
    const btn = screen.getByTestId("edit-btn");
    act(() => {
      btn.click();
    });

    await waitFor(() => {
      expect(mocks.channel.mock.calls.length).toBeGreaterThan(1);
    });
  });
});
