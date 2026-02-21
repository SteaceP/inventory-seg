import React from "react";

import { useNavigate, useLocation } from "react-router-dom";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";

import { useTranslation } from "@/i18n";

interface UserBottomNavigationProps {
  onScanClick: () => void;
}

const UserBottomNavigation: React.FC<UserBottomNavigationProps> = ({
  onScanClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    if (newValue === "scan") {
      onScanClick();
    } else {
      void navigate(newValue);
    }
  };

  const getValue = () => {
    const path = location.pathname;
    if (path === "/") return "/";
    if (path.startsWith("/inventory")) return "/inventory";
    if (path.startsWith("/settings")) return "/settings";
    return "/";
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        pb: "env(safe-area-inset-bottom)",
        borderTop: "1px solid",
        borderColor: "divider",
        background: (theme) =>
          theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.95)" : "#ffffff",
        backdropFilter: "blur(10px)",
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        onChange={handleChange}
        sx={{
          height: 64,
          bgcolor: "transparent",
          "& .MuiBottomNavigationAction-root": {
            color: "text.secondary",
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
        }}
      >
        <BottomNavigationAction
          label={t("menu.dashboard")}
          value="/"
          icon={<DashboardIcon />}
        />
        <BottomNavigationAction
          label={t("menu.inventory")}
          value="/inventory"
          icon={<InventoryIcon />}
        />
        <BottomNavigationAction
          label={t("menu.settings")}
          value="/settings"
          icon={<SettingsIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default UserBottomNavigation;
