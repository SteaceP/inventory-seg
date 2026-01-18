import type { Database } from "./database.types";

export type InventoryItemRow = Database["public"]["Tables"]["inventory"]["Row"];
export type InventoryStockLocationRow =
  Database["public"]["Tables"]["inventory_stock_locations"]["Row"];

export interface InventoryItem extends Omit<InventoryItemRow, "sku" | "stock"> {
  sku: string | null;
  stock: number | null;
  stock_locations?: Partial<InventoryStockLocationRow>[];
}

export type MasterLocation =
  Database["public"]["Tables"]["inventory_locations"]["Row"];

export type InventoryCategory =
  Database["public"]["Tables"]["inventory_categories"]["Row"];

export interface InventoryContextType {
  items: InventoryItem[];
  categories: InventoryCategory[];
  locations: MasterLocation[];
  loading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
  updateCategoryThreshold: (
    name: string,
    threshold: number | null
  ) => Promise<void>;
  presence: Record<
    string,
    { userId: string; displayName: string; editingId: string | null }
  >;
  setEditingId: (id: string | null) => void;
  broadcastInventoryChange: () => void;
}
