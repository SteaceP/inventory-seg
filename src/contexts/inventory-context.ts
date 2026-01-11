import { createContext } from "react";
import type { InventoryContextType } from "../types/inventory";

export const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);
