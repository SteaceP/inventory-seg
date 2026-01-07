import { createContext } from "react";

interface AlertContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);
