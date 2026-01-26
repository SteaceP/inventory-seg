import type { InventoryItem } from "../../../types/inventory";

export type Mode = "menu" | "add" | "remove" | "selectLocation";

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
