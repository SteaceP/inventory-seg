/**
 * Defines the contract for the global alert and notification system.
 */
export interface AlertContextType {
  /** Displays a success notification snackbar */
  showSuccess: (message: string) => void;
  /** Displays an error notification snackbar */
  showError: (message: string) => void;
  /** Displays an informational notification snackbar */
  showInfo: (message: string) => void;
  /** Displays a warning notification snackbar */
  showWarning: (message: string) => void;
}
