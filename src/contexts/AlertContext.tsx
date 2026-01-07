import React, { useState, useCallback, type ReactNode } from "react";
import { Snackbar, Alert, Slide, type AlertProps } from "@mui/material";
import type { SlideProps } from "@mui/material/Slide";
import { AlertContext } from "./alert-context";
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
    (message: string) => {
      showMessage(message, "success");
    },
    [showMessage]
  );

  const showError = useCallback(
    (message: string) => {
      showMessage(message, "error");
    },
    [showMessage]
  );

  const showInfo = useCallback(
    (message: string) => {
      showMessage(message, "info");
    },
    [showMessage]
  );

  const showWarning = useCallback(
    (message: string) => {
      showMessage(message, "warning");
    },
    [showMessage]
  );

  return (
    <AlertContext.Provider
      value={{ showSuccess, showError, showInfo, showWarning }}
    >
      {children}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleClose}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

export default AlertProvider;
