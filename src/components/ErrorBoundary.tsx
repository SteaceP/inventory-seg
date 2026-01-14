import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { ErrorOutline as ErrorIcon } from "@mui/icons-material";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
    // In production, you could send to error tracking service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            p: 4,
            textAlign: "center",
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Something went wrong
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            {this.state.error?.message ||
              "An unexpected error occurred. Please try again."}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ px: 4 }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
