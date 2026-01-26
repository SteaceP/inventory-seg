import type {
  InventoryItem,
  InventoryCategory,
  MasterLocation,
} from "../../types/inventory";
import type { InventoryActivity } from "../../types/activity";

/**
 * Test data factories for creating realistic test objects
 */

let itemIdCounter = 1;
let locationIdCounter = 1;
let activityIdCounter = 1;

export const createMockInventoryItem = (
  overrides?: Partial<InventoryItem>
): InventoryItem => {
  const id = String(itemIdCounter++);
  return {
    id,
    name: `Test Item ${id}`,
    category: "General",
    sku: `SKU-${id}`,
    stock: 10,
    unit_cost: 0,
    image_url: "",
    low_stock_threshold: null,
    notes: "",
    location: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

export const createMockCategory = (
  overrides?: Partial<InventoryCategory>
): InventoryCategory => {
  return {
    name: "Test Category",
    low_stock_threshold: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

export const createMockLocation = (
  overrides?: Partial<MasterLocation>
): MasterLocation => {
  const id = String(locationIdCounter++);
  return {
    id,
    name: `Location ${id}`,
    parent_id: null,
    description: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

export const createMockUser = (overrides?: {
  id?: string;
  email?: string;
  display_name?: string;
  role?: string;
}) => {
  return {
    id: "test-user-id",
    email: "test@example.com",
    display_name: "Test User",
    role: "admin",
    ...overrides,
  };
};

export const createMockActivity = (
  overrides?: Partial<InventoryActivity>
): InventoryActivity => {
  const id = String(activityIdCounter++);
  return {
    id,
    inventory_id: "inv-1",
    user_id: "user-1",
    action: "updated",
    item_name: "Test Item",
    user_display_name: "Test User",
    changes: {},
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

export const resetFactoryCounters = () => {
  itemIdCounter = 1;
  locationIdCounter = 1;
  activityIdCounter = 1;
};
