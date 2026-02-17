import type { Database } from "./database.types";

/** Raw row from the inventory table */
export type InventoryItemRow = Database["public"]["Tables"]["inventory"]["Row"];
/** Raw row from the inventory stock locations table */
export type InventoryStockLocationRow =
  Database["public"]["Tables"]["inventory_stock_locations"]["Row"];

/**
 * Enhanced inventory item with stock calculation and locations.
 */
export interface InventoryItem extends Omit<InventoryItemRow, "sku" | "stock"> {
  /** Stock keeping unit string */
  sku: string | null;
  /** Total stock across all locations */
  stock: number | null;
  /** Detail of stock distributed across locations */
  stock_locations?: Partial<InventoryStockLocationRow>[];
}

/** Represents a physical storage location */
export type MasterLocation =
  Database["public"]["Tables"]["inventory_locations"]["Row"];

/** Represents an inventory category with its own thresholds */
export type InventoryCategory =
  Database["public"]["Tables"]["inventory_categories"]["Row"];

/**
 * Interface for the primary inventory state and operations.
 */
export interface InventoryContextType {
  /** Master list of inventory items */
  items: InventoryItem[];
  /** Available inventory categories */
  categories: InventoryCategory[];
  /** List of all storage locations */
  locations: MasterLocation[];
  /** Data loading state */
  loading: boolean;
  /** Recent error message if any */
  error: string | null;
  /** Force a refresh of all inventory data */
  refreshInventory: () => Promise<void>;
  /** Update low stock threshold for a category */
  updateCategoryThreshold: (
    name: string,
    threshold: number | null
  ) => Promise<void>;
  /** Real-time presence data for collaborative editing */
  presence: Record<
    string,
    { userId: string; displayName: string; editingId: string | null }
  >;
  /** Set the item currently being edited by the local user */
  setEditingId: (id: string | null) => void;
  /** Manually trigger a broadcast of inventory changes */
  broadcastInventoryChange: () => void;
}

/** Structure of the historical activity log */
export interface ActivityLog {
  id: string;
  created_at: string | null;
  action: string;
  changes?: {
    action_type?: string;
    stock?: number;
    old_stock?: number;
    location?: string;
    [key: string]: unknown;
  };
}

/** UI mode for the stock adjustment dialog */
export type StockAdjustmentMode = "menu" | "add" | "remove" | "selectLocation";

/** Helper interface for tracking location selections in UI */
export interface SelectedLocation {
  location: string;
  quantity: number;
  parent_location?: string;
}
