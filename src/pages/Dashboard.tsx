import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Inventory as InventoryIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/ThemeContext";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const { compactView } = useThemeContext();

  return (
    <Paper
      sx={{
        p: compactView ? 2 : 3,
        background: (theme) => theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: compactView ? 1 : 2 }}>
        <Box
          sx={{
            p: compactView ? 0.5 : 1,
            borderRadius: "8px",
            bgcolor: `${color}20`,
            color: color,
            mr: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant={compactView ? "h5" : "h4"} fontWeight="bold">
        {value}
      </Typography>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalStock: 0,
    topCategory: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { compactView, displayName } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data: items, error } = await supabase.from("inventory").select("*");

      if (error) {
        setError("Le chargement des statistiques du tableau de bord a echoué. Veuillez réessayer.");
      } else if (items) {
        const lowStock = items.filter((item) => item.stock < 5).length;
        const totalStock = items.reduce((acc, item) => acc + item.stock, 0);
        const categories = items.map((item) => item.category);
        const topCategory =
          categories.length > 0
            ? categories
              .sort(
                (a, b) =>
                  categories.filter((v) => v === a).length -
                  categories.filter((v) => v === b).length
              )
              .pop() || ""
            : "";

        setStats({
          totalItems: items.length,
          lowStockItems: lowStock,
          totalStock,
          topCategory,
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 0 : 0 }}>
      <Box sx={{ mb: 2 }}>
        <Box
          component="img"
          src="/logo-secondary.svg"
          sx={{ width: 180, height: "auto", mb: 2 }}
          alt="Logo"
        />
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
        >
          {displayName ? `Bonjour, ${displayName} !` : "Tableau de bord"}
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {displayName ? "Voici un aperçu de votre inventaire aujourd'hui." : "Gestion globale de votre stock et statistiques."}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Total des articles"
            value={stats.totalItems.toLocaleString()}
            icon={
              <Box
                component="img"
                src="/icon.svg"
                sx={{ width: 24, height: 24 }}
                alt="Logo"
              />
            }
            color="#027d6f"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Catégorie Principale"
            value={stats.topCategory}
            icon={<PeopleIcon />}
            color="#d29922"
          />
        </Grid>
      </Grid>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
