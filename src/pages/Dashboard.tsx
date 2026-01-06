import React, { useState, useEffect, useMemo } from "react";
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
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/ThemeContext";
import { useInventoryContext } from "../contexts/InventoryContext";
import RecentActivity from "../components/dashboard/RecentActivity";

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: compactView ? 1 : 2 }}>
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
      <Typography variant={compactView ? "h5" : "h4"} fontWeight="bold" align="center">
        {value}
      </Typography>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const { items, loading: inventoryLoading } = useInventoryContext();
  const [dailyStats, setDailyStats] = useState({ in: 0, out: 0 });
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const { compactView, displayName } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const stats = useMemo(() => {
    if (!items) return { totalItems: 0, lowStockItems: 0, totalStock: 0, topCategory: "" };

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

    return {
      totalItems: items.length,
      lowStockItems: lowStock,
      totalStock,
      topCategory,
    };
  }, [items]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setActivitiesLoading(true);
      try {
        // Fetch daily activity stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: dailyActivities } = await supabase
          .from("inventory_activity")
          .select("action, changes")
          .gte("created_at", today.toISOString())
          .in("action", ["created", "deleted", "updated"]);

        if (dailyActivities) {
          let stockIn = 0;
          let stockOut = 0;

          dailyActivities.forEach((activity: any) => {
            const changes = activity.changes || {};

            if (activity.action === "created") {
              stockIn += (changes.stock || 0);
            } else if (activity.action === "deleted") {
              stockOut += (changes.stock || 0);
            } else if (activity.action === "updated") {
              const newStock = changes.stock;
              const oldStock = changes.old_stock;

              if (typeof newStock === "number" && typeof oldStock === "number") {
                const diff = newStock - oldStock;
                if (diff > 0) stockIn += diff;
                else if (diff < 0) stockOut += Math.abs(diff);
              }
            }
          });

          setDailyStats({ in: stockIn, out: stockOut });
        }

        // Fetch Recent Activities
        const { data, error } = await supabase
          .from("inventory_activity")
          .select(`
            id,
            action,
            item_name,
            created_at,
            user_id
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data) {
          const userIds = [...new Set(data.map((a) => a.user_id).filter(Boolean))];
          const { data: userSettings } = await supabase
            .from("user_settings")
            .select("user_id, display_name")
            .in("user_id", userIds);

          const userMap = new Map(
            userSettings?.map((u) => [u.user_id, u.display_name]) || []
          );

          const activitiesWithNames = data.map((activity) => ({
            ...activity,
            user_display_name: userMap.get(activity.user_id) || "Utilisateur",
          }));

          setRecentActivities(activitiesWithNames);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Erreur de chargement du tableau de bord.");
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const loading = inventoryLoading || activitiesLoading;

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

      <Grid container spacing={3} sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Mouvements (Stock)"
            value={`+${dailyStats.in} / -${dailyStats.out}`}
            icon={<TimelineIcon />}
            color="#0969da"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <RecentActivity activities={recentActivities} />
      </Box>

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
