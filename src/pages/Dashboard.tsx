import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, useTheme, alpha, Paper, Grid } from "@mui/material";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useUserContext } from "../contexts/UserContext";
import { useTranslation } from "../i18n";
import { useInventoryContext } from "../contexts/InventoryContext";
import { useThemeContext } from "../contexts/ThemeContext";
import QuickActions from "../components/dashboard/QuickActions";
import StockHealth from "../components/dashboard/StockHealth";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { supabase } from "../supabaseClient";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const { compactView } = useThemeContext();
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(color, 0.05)
            : alpha(color, 0.02),
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px -10px ${alpha(color, 0.3)}`,
          borderColor: alpha(color, 0.4),
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -10,
          right: -10,
          opacity: 0.05,
          transform: "scale(2.5)",
          color: color,
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1, sm: 1.5 },
          mb: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 0.5, sm: 0.75 },
            borderRadius: "8px",
            bgcolor: alpha(color, 0.1),
            color: color,
            minWidth: "fit-content",
            "& svg": { fontSize: { xs: 16, sm: 20 } },
            "& img": { width: { xs: 16, sm: 20 }, height: { xs: 16, sm: 20 } },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="700"
          noWrap
          sx={{
            textTransform: "uppercase",
            letterSpacing: { xs: 0.5, sm: 1 },
            fontSize: { xs: "0.625rem", sm: "0.7rem" },
          }}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant={compactView ? "h6" : "h4"}
        fontWeight="900"
        sx={{
          color: color,
          letterSpacing: "-0.02em",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: { xs: "1rem", sm: "1.35rem", md: "1.85rem" },
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const { handleError } = useErrorHandler();
  const { lowStockThreshold } = useUserContext();
  const [dailyStats, setDailyStats] = useState({ in: 0, out: 0 });
  const { t } = useTranslation();
  const { items, categories: contextCategories } = useInventoryContext();

  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStockItems = items
      .filter((item) => {
        const categoryThreshold = contextCategories.find(
          (c) => c.name === item.category
        )?.low_stock_threshold;
        const effectiveThreshold =
          item.low_stock_threshold ?? categoryThreshold ?? lowStockThreshold;
        return (item.stock || 0) <= (effectiveThreshold || 0);
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        stock: item.stock || 0,
      }));

    const categoryCounts: Record<string, number> = {};
    items.forEach((item) => {
      if (item.category) {
        categoryCounts[item.category] =
          (categoryCounts[item.category] || 0) + 1;
      }
    });

    const topCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A";
    return { totalItems, lowStockItems, topCategory };
  }, [items, lowStockThreshold, contextCategories]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch("/api/activity/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await response.json();
        setDailyStats(data as { in: number; out: number });
      } catch (err) {
        handleError(err, t("errors.loadDashboard"));
      }
    };
    void fetchDashboardData();
  }, [t, handleError]);

  return (
    <Box sx={{ p: 3, maxWidth: "1600px", mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" gutterBottom>
          {t("dashboard.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("dashboard.welcome")}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mt: 2 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t("dashboard.totalItems")}
            value={stats.totalItems.toLocaleString()}
            icon={<InventoryIcon />}
            color="#027d6f"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t("dashboard.lowStockItems")}
            value={stats.lowStockItems.length}
            icon={<WarningIcon />}
            color="#d29922"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t("dashboard.topCategory")}
            value={stats.topCategory}
            icon={<CategoryIcon />}
            color="#0969da"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t("dashboard.movements")}
            value={`+${dailyStats.in} / -${dailyStats.out}`}
            icon={<HistoryIcon />}
            color="#1a748b"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <StockHealth />
      </Box>
      <Box sx={{ mt: 4 }}>
        <QuickActions />
      </Box>
    </Box>
  );
};

export default Dashboard;
