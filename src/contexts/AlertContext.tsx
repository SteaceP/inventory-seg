/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  use,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { Snackbar, Alert, Slide, type AlertProps } from "@mui/material";
import type { SlideProps } from "@mui/material/Slide";

interface AlertContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(
  undefined
);

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
