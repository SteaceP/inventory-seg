import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getStockChange,
  getActivityNarrative,
  logActivity,
} from "../activityUtils";
import type { InventoryActivity } from "@/types/activity";

describe("getStockChange", () => {
  it("should return null when stock has not changed", () => {
    const changes = { old_stock: 10, stock: 10 };
    expect(getStockChange(changes)).toBeNull();
  });

  it("should calculate positive stock change", () => {
    const changes = { old_stock: 10, stock: 15 };
    const result = getStockChange(changes);

    expect(result).toEqual({
      diff: 5,
      oldStock: 10,
      newStock: 15,
      color: "success",
    });
  });

  it("should calculate negative stock change", () => {
    const changes = { old_stock: 10, stock: 5 };
    const result = getStockChange(changes);

    expect(result).toEqual({
      diff: -5,
      oldStock: 10,
      newStock: 5,
      color: "error",
    });
  });

  it("should handle missing old_stock (defaults to 0)", () => {
    const changes = { stock: 10 };
    const result = getStockChange(changes);

    expect(result).toEqual({
      diff: 10,
      oldStock: 0,
      newStock: 10,
      color: "success",
    });
  });

  it("should handle missing stock (defaults to 0)", () => {
    const changes = { old_stock: 10 };
    const result = getStockChange(changes);

    expect(result).toEqual({
      diff: -10,
      oldStock: 10,
      newStock: 0,
      color: "error",
    });
  });

  it("should handle empty changes object", () => {
    const result = getStockChange({});
    expect(result).toBeNull();
  });
});

describe("getActivityNarrative", () => {
  const mockT = (key: string, params?: Record<string, unknown>) => {
    // Simple mock translation function that returns key + params
    return `${key}:${JSON.stringify(params)}`;
  };

  it("should generate narrative for created action", () => {
    const activity: InventoryActivity = {
      id: "1",
      inventory_id: "inv-1",
      user_id: "user-1",
      action: "created",
      item_name: "Laptop",
      user_display_name: "John Doe",
      changes: {},
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("created");
    expect(result).toContain("John Doe");
    expect(result).toContain("Laptop");
  });

  it("should generate narrative for deleted action", () => {
    const activity: InventoryActivity = {
      id: "2",
      inventory_id: "inv-2",
      user_id: "user-1",
      action: "deleted",
      item_name: "Mouse",
      user_display_name: "Jane Smith",
      changes: {},
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("deleted");
    expect(result).toContain("Jane Smith");
    expect(result).toContain("Mouse");
  });

  it("should generate narrative for stock added", () => {
    const activity: InventoryActivity = {
      id: "3",
      inventory_id: "inv-3",
      user_id: "user-1",
      action: "updated",
      item_name: "Keyboard",
      user_display_name: "Admin",
      changes: {
        action_type: "add",
        old_stock: 10,
        stock: 15,
        location: "Warehouse",
      },
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("stockAdded");
    expect(result).toContain("Admin");
    expect(result).toContain("5"); // count
    expect(result).toContain("Keyboard");
  });

  it("should generate narrative for stock removed with recipient and destination", () => {
    const activity: InventoryActivity = {
      id: "4",
      inventory_id: "inv-4",
      user_id: "user-1",
      action: "updated",
      item_name: "Monitor",
      user_display_name: "Admin",
      changes: {
        action_type: "remove",
        old_stock: 10,
        stock: 5,
        recipient: "Engineering Team",
        destination_location: "Office A",
      },
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("stockRemovedFull");
    expect(result).toContain("Engineering Team");
    expect(result).toContain("Office A");
  });

  it("should generate narrative for stock removed with recipient only", () => {
    const activity: InventoryActivity = {
      id: "5",
      inventory_id: "inv-5",
      user_id: "user-1",
      action: "updated",
      item_name: "Chair",
      user_display_name: "Admin",
      changes: {
        action_type: "remove",
        old_stock: 10,
        stock: 8,
        recipient: "Sales Team",
      },
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("stockRemovedRecipient");
    expect(result).toContain("Sales Team");
  });

  it("should generate narrative for stock removed without recipient", () => {
    const activity: InventoryActivity = {
      id: "6",
      inventory_id: "inv-6",
      user_id: "user-1",
      action: "updated",
      item_name: "Desk",
      user_display_name: "Admin",
      changes: {
        action_type: "remove",
        old_stock: 5,
        stock: 3,
        location: "Storage",
      },
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("stockRemoved");
    expect(result).toContain("Storage");
  });

  it("should generate generic updated narrative for other actions", () => {
    const activity: InventoryActivity = {
      id: "7",
      inventory_id: "inv-7",
      user_id: "user-1",
      action: "updated",
      item_name: "Phone",
      user_display_name: "User",
      changes: {
        name: "New Phone Name",
      },
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("updated");
    expect(result).toContain("User");
    expect(result).toContain("Phone");
  });

  it("should handle missing user (defaults to System)", () => {
    const activity: InventoryActivity = {
      id: "8",
      inventory_id: "inv-8",
      user_id: null,
      action: "created",
      item_name: "Item",
      changes: {},
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("System");
  });

  it("should handle missing item name (defaults to Unknown Item)", () => {
    const activity: InventoryActivity = {
      id: "9",
      inventory_id: "inv-9",
      user_id: "user-1",
      action: "created",
      item_name: "",
      user_display_name: "User",
      changes: {},
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("Unknown Item");
  });

  it("should combine parent location and location", () => {
    const activity: InventoryActivity = {
      id: "10",
      inventory_id: "inv-10",
      user_id: "user-1",
      action: "updated",
      item_name: "Item",
      user_display_name: "User",
      changes: {
        action_type: "add",
        old_stock: 0,
        stock: 5,
        parent_location: "Warehouse A",
        location: "Shelf 1",
      },
      created_at: "2024-01-01",
    };

    const result = getActivityNarrative(activity, mockT);
    expect(result).toContain("Warehouse A Shelf 1");
  });
});

describe("logActivity", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call fetch with correct parameters", async () => {
    const activity = {
      inventory_id: "123",
      user_id: "u1",
      action: "test",
      item_name: "Test Item",
      changes: {},
    };
    const session = { access_token: "token123" };
    const handleError = vi.fn();

    await logActivity(activity, session, handleError);

    expect(global.fetch).toHaveBeenCalledWith("/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token123",
      },
      body: JSON.stringify(activity),
    });
    expect(handleError).not.toHaveBeenCalled();
  });

  it("should handle error during fetch", async () => {
    const error = new Error("Network error");
    vi.mocked(global.fetch).mockRejectedValueOnce(error);
    const handleError = vi.fn();

    const mockActivity = {
      inventory_id: "1",
      user_id: "u1",
      action: "test",
      item_name: "item",
      changes: {},
    };

    await logActivity(mockActivity, null, handleError);

    expect(handleError).toHaveBeenCalledWith(error);
  });
});
