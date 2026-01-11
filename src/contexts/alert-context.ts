import { createContext } from "react";
import type { AlertContextType } from "../types/alert";

export const AlertContext = createContext<AlertContextType | undefined>(
  undefined
);
