/* eslint-disable react-refresh/only-export-components */
import { render } from "@testing-library/react";
import { vi } from "vitest";

import { mockAlertContext, mockUserContext } from "@test/mocks/contexts";
import { mockSupabaseClient } from "@test/mocks/supabase";

import { InventoryProvider, useInventoryContext } from "../InventoryContext";

// 1. Mock external dependencies using async factories to access centralized mocks
vi.mock("../AlertContext", async () => {
  const { mockAlertContext } = await import("../../test/mocks/contexts");
  return {
    useAlert: () => mockAlertContext,
  };
});

vi.mock("../UserContext", async () => {
  const { mockUserContext } = await import("../../test/mocks/contexts");
  return {
    useUserContext: () => mockUserContext,
  };
});

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@supabaseClient", async () => {
  const { mockSupabaseClient } = await import("@test/mocks/supabase");
  return {
    supabase: mockSupabaseClient.client,
  };
});

// 2. Shared Test Data
export const mockItems = [
  { id: "1", name: "Item 1", category: "Cat1", stock: 10 },
  { id: "2", name: "Item 2", category: "Cat2", stock: 5 },
];
export const mockCategories = [{ name: "Cat1", low_stock_threshold: 5 }];
export const mockLocations = [{ id: "loc1", name: "Warehouse" }];

// 3. Test Component
export const TestComponent = () => {
  const {
    items,
    loading,
    error,
    updateCategoryThreshold,
    broadcastInventoryChange,
    setEditingId,
  } = useInventoryContext();

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Error:{" "}
        {typeof error === "string"
          ? error
          : (error as Error).message || "Unknown error"}
      </div>
    );

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

// 4. Helper to render with provider
export const renderWithProvider = (ui: React.ReactElement) => {
  return render(<InventoryProvider>{ui}</InventoryProvider>);
};

// 5. Export the mocks for assertions
// We export the SAME singletons that the async mocks will use
export const mocks = {
  // Supabase
  supabase: mockSupabaseClient.mocks,
  helpers: mockSupabaseClient.helpers,
  // Alert
  alert: mockAlertContext,
  // User
  user: mockUserContext,
};
