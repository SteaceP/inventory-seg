export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  image_url?: string;
  low_stock_threshold?: number | null;
  location?: string;
  stock_locations?: {
    id?: string;
    location: string;
    quantity: number;
    parent_location?: string;
  }[];
}

export interface MasterLocation {
  id: string;
  name: string;
  parent_id: string | null;
  description?: string;
  created_at: string;
}

export interface InventoryCategory {
  name: string;
  low_stock_threshold: number | null;
}

export interface InventoryContextType {
  items: InventoryItem[];
  categories: InventoryCategory[];
  loading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
  updateCategoryThreshold: (
    name: string,
    threshold: number | null
  ) => Promise<void>;
}
