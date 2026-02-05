import React from "react";

import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningIcon from "@mui/icons-material/Warning";

import { useTranslation } from "@/i18n";

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ items }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <Paper
      sx={{
        p: 3,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(210, 153, 34, 0.1)" // subtle yellow in dark mode
            : "#fffbea", // subtle yellow in light mode
        border: "1px solid",
        borderColor: "#d29922",
        borderRadius: "12px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon sx={{ color: "#d29922" }} />
          <Typography variant="h6" fontWeight="bold" color="#d29922">
            {t("dashboard.lowStock.title")}
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => void navigate("/inventory?filter=lowStock")}
          sx={{ color: "#d29922" }}
        >
          {t("dashboard.lowStock.viewAll")}
        </Button>
      </Box>

      <List sx={{ p: 0 }}>
        {items.map((item, index) => (
          <ListItem
            key={item.id}
            sx={{
              px: 0,
              py: 1,
              borderBottom: index < items.length - 1 ? "1px solid" : "none",
              borderColor: "rgba(210, 153, 34, 0.2)",
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight="medium">
                  {item.name}
                </Typography>
              }
            />
            <Chip
              label={`${item.stock}`}
              size="small"
              sx={{
                bgcolor: "#d29922",
                color: "white",
                fontWeight: "bold",
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default LowStockAlert;
