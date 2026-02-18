import { useState, useEffect, lazy, Suspense } from "react";

import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import WifiOffIcon from "@mui/icons-material/WifiOff";

import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/layout/Layout";
import RealtimeNotifications from "./components/RealtimeNotifications";
import { AlertProvider } from "./contexts/AlertContext";
import { AuthProvider } from "./contexts/AuthContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { useUserContext } from "./contexts/UserContext.ts";
import UserProvider from "./contexts/UserContext.tsx";
import { useTranslation } from "./i18n";
import { getTheme } from "./theme";

// Lazy load pages for better bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Appliances = lazy(() => import("./pages/Appliances"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Settings = lazy(() => import("./pages/Settings"));
const InventoryActivity = lazy(() => import("./pages/InventoryActivity"));
const StockLocations = lazy(() => import("./pages/StockLocations"));
const Reports = lazy(() => import("./pages/ReportsPage"));

// Loading component for Suspense
const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
      gap: 2,
    }}
  >
    <Box
      component="img"
      src="/icons/icon.svg"
      sx={{
        width: 60,
        height: 60,
        animation: "pulse 2s infinite ease-in-out",
        "@keyframes pulse": {
          "0%": { transform: "scale(0.95)", opacity: 0.8 },
          "50%": { transform: "scale(1.05)", opacity: 1 },
          "100%": { transform: "scale(0.95)", opacity: 0.8 },
        },
      }}
      alt="Logo"
    />
    <CircularProgress size={20} />
  </Box>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useUserContext();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { loading, darkMode } = useUserContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleChunkError = () => {
      window.location.reload();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("vite:preloadError", handleChunkError);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("vite:preloadError", handleChunkError);
    };
  }, []);

  const theme = getTheme(darkMode ? "dark" : "light");

  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  if (loading && !isAuthPage) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
          }}
        >
          <PageLoader />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RealtimeNotifications />
      <AnimatePresence mode="wait">
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Box
              sx={{
                bgcolor: "error.main",
                color: "white",
                py: 0.75,
                px: 2,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                fontSize: "0.875rem",
                fontWeight: 600,
                zIndex: 2000,
                position: "relative",
              }}
            >
              <WifiOffIcon fontSize="small" />
              {t("common.offline")}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/reports" element={<Reports />} />
            <Route path="inventory/activity" element={<InventoryActivity />} />
            <Route path="appliances" element={<Appliances />} />
            <Route path="inventory/locations" element={<StockLocations />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AlertProvider>
          <AuthProvider>
            <UserProvider>
              <InventoryProvider>
                <Router>
                  <AppContent />
                </Router>
              </InventoryProvider>
            </UserProvider>
          </AuthProvider>
        </AlertProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
