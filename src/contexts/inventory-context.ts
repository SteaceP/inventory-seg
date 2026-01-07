import { createContext } from "react";
import type { InventoryItem } from "../types/inventory";

export interface InventoryContextType {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);
