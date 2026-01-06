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

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#58a6ff",
    },
    background: {
      default: "#0d1117",
      paper: "#161b22",
    },
    text: {
      primary: "#c9d1d9",
      secondary: "#8b949e",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
  },
  components: {
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
          backgroundColor: "#0d1117",
        },
      },
    },
  },
});

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
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
          <CircularProgress size={24} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
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
}

export default App;
