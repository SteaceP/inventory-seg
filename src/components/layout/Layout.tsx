import React, { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useUserContext } from "@contexts/UserContext";
import { useTranslation } from "@/i18n";

// Sub-components
import SidebarHeader from "./SidebarHeader/SidebarHeader";
import UserProfile from "./UserProfile/UserProfile";
import NavigationList from "./NavigationList/NavigationList";
import MobileAppBar from "./MobileAppBar/MobileAppBar";
import AssistantFAB from "../assistant/AssistantFAB";

import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from "@mui/material/CssBaseline";
import ApplianceIcon from "@mui/icons-material/Kitchen";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import ActivityIcon from "@mui/icons-material/History";
import LocationIcon from "@mui/icons-material/LocationOn";
import AssessmentIcon from "@mui/icons-material/Assessment";

const Layout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const { compactView, displayName, avatarUrl } = useUserContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();

  const drawerWidth = 240;
  const collapsedWidth = 64;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: t("menu.dashboard"), icon: <DashboardIcon />, path: "/" },
    {
      text: t("menu.inventory"),
      icon: (
        <Box
          component="img"
          src="/icons/icon.svg"
          sx={{
            width: compactView ? 20 : 24,
            height: compactView ? 20 : 24,
            filter:
              location.pathname === "/inventory" ? "none" : "grayscale(1)",
          }}
        />
      ),
      path: "/inventory",
    },
    {
      text: t("menu.activity"),
      icon: <ActivityIcon />,
      path: "/inventory/activity",
    },
    {
      text: t("menu.locations"),
      icon: <LocationIcon />,
      path: "/inventory/locations",
    },
    {
      text: t("menu.reports"),
      icon: <AssessmentIcon />,
      path: "/inventory/reports",
    },
    {
      text: t("menu.appliances"),
      icon: <ApplianceIcon />,
      path: "/appliances",
    },
    { text: t("menu.settings"), icon: <SettingsIcon />, path: "/settings" },
  ];

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const currentDrawerWidth = isMobile
    ? drawerWidth
    : collapsed
      ? collapsedWidth
      : drawerWidth;

  const sidebarContent = (
    <>
      <SidebarHeader
        collapsed={collapsed}
        isMobile={isMobile}
        compactView={compactView}
        onToggle={handleDrawerToggle}
      />
      <UserProfile
        displayName={displayName}
        avatarUrl={avatarUrl}
        collapsed={collapsed}
        isMobile={isMobile}
        compactView={compactView}
      />
      <Divider sx={{ borderColor: "divider" }} />
      <Box sx={{ overflow: "auto", mt: compactView ? 1 : 2 }}>
        <NavigationList
          menuItems={menuItems}
          collapsed={collapsed}
          isMobile={isMobile}
          compactView={compactView}
          onNavigate={() => isMobile && setMobileOpen(false)}
        />
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <CssBaseline />
      {isMobile && (
        <MobileAppBar
          mobileOpen={mobileOpen}
          compactView={compactView}
          onToggle={handleDrawerToggle}
        />
      )}

      <Box
        component="nav"
        sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                bgcolor: "sidebar.background",
                borderRight: "1px solid",
                borderColor: "sidebar.border",
                color: "sidebar.text",
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: currentDrawerWidth,
                background: (theme) => theme.palette.sidebar.background,
                backdropFilter: "blur(10px)",
                borderRight: "1px solid",
                borderColor: "sidebar.border",
                color: "sidebar.text",
                transition: "width 0.2s ease-in-out",
                overflowX: "hidden",
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: compactView
            ? { xs: 1.5, sm: 2, md: 2.5 }
            : { xs: 2, sm: 3, md: 4 },
          pb: 8, // Add padding to prevent FAB overlap
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          mt: isMobile ? (compactView ? "48px" : "64px") : 0,
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
      <AssistantFAB />
    </Box>
  );
};

export default Layout;
