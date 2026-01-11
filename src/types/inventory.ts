export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  image_url?: string;
}

export interface InventoryContextType {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
}
