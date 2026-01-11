import React, { useState, useEffect, useMemo } from "react";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import {
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/useThemeContext";
import { useUserContext } from "../contexts/useUserContext";
import { useTranslation } from "../i18n";
import { useInventoryContext } from "../contexts/useInventoryContext";
import RecentActivity from "../components/dashboard/RecentActivity";
import LowStockAlert from "../components/dashboard/LowStockAlert";
import { useAlert } from "../contexts/useAlertContext";

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
        background: (theme) =>
          theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.7)" : "#ffffff",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: compactView ? 1 : 2,
        }}
      >
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
      <Typography
        variant={compactView ? "h5" : "h4"}
        fontWeight="bold"
        align="center"
      >
        {value}
      </Typography>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const { items, loading: inventoryLoading } = useInventoryContext();
  const { lowStockThreshold, displayName } = useUserContext();
  const [dailyStats, setDailyStats] = useState({ in: 0, out: 0 });
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  type ActivityRow = { action?: string; changes?: Record<string, unknown> };
  type RecentActivityItem = {
    id: string;
    action: "created" | "updated" | "deleted";
    item_name: string;
    created_at: string;
    user_display_name?: string;
  };
  const [recentActivities, setRecentActivities] = useState<
    RecentActivityItem[]
  >([]);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showError } = useAlert();

  const stats = useMemo(() => {
    if (!items)
      return {
        totalItems: 0,
        lowStockItems: 0,
        totalStock: 0,
        topCategory: "",
        lowStockList: [],
      };

    const lowStockList = items.filter((item) => item.stock <= lowStockThreshold);
    const lowStock = lowStockList.length;
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
      lowStockList: lowStockList.slice(0, 5), // Show top 5 in alert
    };
  }, [items, lowStockThreshold]);

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

          const getNumber = (obj: Record<string, unknown>, key: string) => {
            const v = obj[key];
            if (typeof v === "number") return v;
            if (
              typeof v === "string" &&
              v.trim() !== "" &&
              !Number.isNaN(Number(v))
            )
              return Number(v);
            return 0;
          };

          dailyActivities.forEach((activity: ActivityRow) => {
            const changes = (activity.changes || {}) as Record<string, unknown>;

            if (activity.action === "created") {
              stockIn += getNumber(changes, "stock");
            } else if (activity.action === "deleted") {
              stockOut += getNumber(changes, "stock");
            } else if (activity.action === "updated") {
              const newStock = getNumber(changes, "stock");
              const oldStock = getNumber(changes, "old_stock");

              const diff = newStock - oldStock;
              if (diff > 0) stockIn += diff;
              else if (diff < 0) stockOut += Math.abs(diff);
            }
          });

          setDailyStats({ in: stockIn, out: stockOut });
        }

        // Fetch Recent Activities
        const { data, error } = await supabase
          .from("inventory_activity")
          .select(
            `
            id,
            action,
            item_name,
            created_at,
            user_id
          `
          )
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data) {
          const userIds = [
            ...new Set(data.map((a) => a.user_id).filter(Boolean)),
          ];
          const { data: userSettings } = await supabase
            .from("user_settings")
            .select("user_id, display_name")
            .in("user_id", userIds);

          const userMap = new Map(
            userSettings?.map((u) => [u.user_id, u.display_name]) || []
          );

          const activitiesWithNames = data.map((activity) => ({
            ...activity,
            user_display_name:
              userMap.get(activity.user_id) || t("user.default"),
          }));

          setRecentActivities(activitiesWithNames);
        } else if (error) {
          // Handle error for fetching recent activities
          throw error;
        }
      } catch (err) {
        showError(t("errors.loadDashboard") + ": " + (err as Error).message);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchDashboardData();
  }, [t, showError]);

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
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          {displayName
            ? `${t("dashboard.hello")}, ${displayName} !`
            : t("dashboard.title")}
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {displayName
          ? t("dashboard.description.withName")
          : t("dashboard.description.default")}
      </Typography>

      <Grid
        container
        spacing={3}
        sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
      >
        <Grid size={{ xs: 12, sm: 3 }}>
          <StatCard
            title={t("dashboard.totalItems")}
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
        <Grid size={{ xs: 12, sm: 3 }}>
          <StatCard
            title={t("dashboard.lowStockItems")}
            value={stats.lowStockItems}
            icon={<WarningIcon />}
            color="#d29922"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <StatCard
            title={t("dashboard.topCategory")}
            value={stats.topCategory}
            icon={<PeopleIcon />}
            color="#0969da"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <StatCard
            title={t("dashboard.movements")}
            value={`+${dailyStats.in} / -${dailyStats.out}`}
            icon={<TimelineIcon />}
            color="#1a748b"
          />
        </Grid>
      </Grid>

      {stats.lowStockList.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <LowStockAlert items={stats.lowStockList} />
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <RecentActivity activities={recentActivities} />
      </Box>
    </Box>
  );
};

export default Dashboard;
