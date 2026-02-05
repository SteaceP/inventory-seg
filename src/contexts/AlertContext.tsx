/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  use,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

import type { AlertProps } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import type { SlideProps } from "@mui/material/Slide";
import Slide from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";

import type { AlertContextType } from "@/types/alert";

const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * Hook to access the global alert system.
 * Must be used within an AlertProvider.
 *
 * @returns {AlertContextType} The alert context value.
 * @throws {Error} if used outside of AlertProvider.
 */
export const useAlert = () => {
  const context = use(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

interface AlertState {
  open: boolean;
  message: string;
  severity: AlertProps["severity"];
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

/**
 * Provider component for the global alert system.
 * Manages snackbar state and provides methods to show different alert severities.
 *
 * @param {Object} props - Component props.
 * @param {ReactNode} props.children - Child components to be wrapped.
 */
export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "info",
  });

  const handleClose = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  const showMessage = useCallback(
    (message: string, severity: AlertProps["severity"]) => {
      setAlert({ open: true, message, severity });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string) => showMessage(message, "success"),
    [showMessage]
  );

  const showError = useCallback(
    (message: string) => showMessage(message, "error"),
    [showMessage]
  );

  const showInfo = useCallback(
    (message: string) => showMessage(message, "info"),
    [showMessage]
  );

  const showWarning = useCallback(
    (message: string) => showMessage(message, "warning"),
    [showMessage]
  );

  const contextValue = useMemo(
    () => ({ showSuccess, showError, showInfo, showWarning }),
    [showSuccess, showError, showInfo, showWarning]
  );

  return (
    <AlertContext value={contextValue}>
      {children}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        slots={{ transition: SlideTransition }}
      >
        <Alert
          onClose={handleClose}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AlertContext>
  );
};
