import { use } from "react";
import { InventoryContext } from "./inventory-context";

export const useInventoryContext = () => {
  const context = use(InventoryContext);
  if (context === undefined) {
    throw new Error(
      "useInventoryContext must be used within an InventoryProvider"
    );
  }
  return context;
};
