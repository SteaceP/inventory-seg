import React, { useState, useEffect } from "react";
import { Typography, Paper, Box, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { supabase } from "../supabaseClient";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      background: "rgba(22, 27, 34, 0.7)",
      backdropFilter: "blur(10px)",
      border: "1px solid #30363d",
      borderRadius: "12px",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box
        sx={{
          p: 1,
          borderRadius: "8px",
          bgcolor: `${color}20`,
          color: color,
          mr: 2,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" fontWeight="bold">
      {value}
    </Typography>
  </Paper>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    topCategory: "N/A",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("inventory").select("*");

      if (error) {
        console.error("Error fetching stats:", error);
      } else if (data) {
        const totalItems = data.length;
        const totalValue = data.reduce(
          (sum, item) => sum + item.price * item.stock,
          0
        );

        const categories = data.reduce(
          (acc: { [key: string]: number }, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
          },
          {}
        );

        const topCategory =
          Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          "N/A";

        setStats({
          totalItems,
          totalValue,
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
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's what's happening today.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Total Items"
            value={stats.totalItems.toLocaleString()}
            icon={<InventoryIcon />}
            color="#58a6ff"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Total Value"
            value={`$${stats.totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<TrendingUpIcon />}
            color="#3fb950"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Top Category"
            value={stats.topCategory}
            icon={<PeopleIcon />}
            color="#d29922"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
