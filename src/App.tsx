import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  CircularProgress,
} from "@mui/material";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import Layout from "./components/Layout";
import "./App.css";

// Lazy load pages for better bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Login = lazy(() => import("./pages/Login"));
const Settings = lazy(() => import("./pages/Settings"));

// Loading component for Suspense
const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
      gap: 2
    }}
  >
    <Box
      component="img"
      src="/icon.svg"
      sx={{
        width: 60,
        height: 60,
        animation: "pulse 2s infinite ease-in-out",
        "@keyframes pulse": {
          "0%": { transform: "scale(0.95)", opacity: 0.8 },
          "50%": { transform: "scale(1.05)", opacity: 1 },
          "100%": { transform: "scale(0.95)", opacity: 0.8 },
        }
      }}
      alt="Logo"
    />
    <CircularProgress size={20} />
  </Box>
);

const getTheme = (mode: "light" | "dark") => createTheme({
  palette: {
    mode,
    primary: {
      main: "#027d6f", // Emerald Teal from logo
      light: "#4a9c8b",
      dark: "#0d576a",
    },
    secondary: {
      main: "#1a748b", // Steel Blue from logo
    },
    background: {
      default: mode === "dark" ? "#0d1117" : "#f6f8fa",
      paper: mode === "dark" ? "#161b22" : "#ffffff",
    },
    text: {
      primary: mode === "dark" ? "#c9d1d9" : "#1F2328",
      secondary: mode === "dark" ? "#8b949e" : "#636c76",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === "dark" ? "#0d1117" : "#f6f8fa",
          backgroundImage: mode === "dark"
            ? "radial-gradient(circle at top right, rgba(2, 125, 111, 0.05), transparent 400px), radial-gradient(circle at bottom left, rgba(13, 87, 106, 0.05), transparent 400px)"
            : "radial-gradient(circle at top right, rgba(2, 125, 111, 0.03), transparent 400px), radial-gradient(circle at bottom left, rgba(13, 87, 106, 0.03), transparent 400px)",
        },
      },
    },
  },
});

import { ThemeProvider as CustomThemeProvider, useThemeContext } from "./contexts/ThemeContext";

const AppContent = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useThemeContext();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const theme = getTheme(darkMode ? "dark" : "light");

  if (loading) {
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
            gap: 3
          }}
        >
          <Box
            component="img"
            src="/icon.svg"
            sx={{
              width: 80,
              height: 80,
              animation: "pulse 2s infinite ease-in-out",
              "@keyframes pulse": {
                "0%": { transform: "scale(0.95)", opacity: 0.8 },
                "50%": { transform: "scale(1.05)", opacity: 1 },
                "100%": { transform: "scale(0.95)", opacity: 0.8 },
              }
            }}
            alt="Logo"
          />
          <CircularProgress size={24} color="primary" />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/login"
              element={!session ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={session ? <Layout /> : <Navigate to="/login" />}
            >
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}

export default App;
