export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  image_url?: string;
}
