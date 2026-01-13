export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  image_url?: string;
  low_stock_threshold?: number | null;
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
