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

export type StockAdjustmentMode = "menu" | "add" | "remove" | "selectLocation";

export interface StockAdjustmentDialogProps {
  open: boolean;
  item: InventoryItem | null;
  isMobile: boolean;
  onClose: () => void;
  onSave: (
    itemId: string,
    newStock: number,
    location?: string,
    actionType?: "add" | "remove",
    parentLocation?: string,
    recipient?: string,
    destination_location?: string
  ) => void;
  loading?: boolean;
}

export interface SelectedLocation {
  location: string;
  quantity: number;
  parent_location?: string;
}

export interface PrintItem {
  name: string;
  sku: string;
  category: string;
}

export interface BarcodePrinterProps {
  items: PrintItem[];
}
