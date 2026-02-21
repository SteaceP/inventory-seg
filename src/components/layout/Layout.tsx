import React, { useState } from "react";

import { useLocation, Outlet, useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ActivityIcon from "@mui/icons-material/History";
import ApplianceIcon from "@mui/icons-material/Kitchen";
import LocationIcon from "@mui/icons-material/LocationOn";
import SettingsIcon from "@mui/icons-material/Settings";

import { useTranslation } from "@/i18n";

import { useUserContext } from "@contexts/UserContextDefinition";
import { useErrorHandler } from "@hooks/useErrorHandler";

import MobileAppBar from "./MobileAppBar/MobileAppBar";
import NavigationList from "./NavigationList/NavigationList";
import SidebarHeader from "./SidebarHeader/SidebarHeader";
import UserBottomNavigation from "./UserBottomNavigation";
import UserProfile from "./UserProfile/UserProfile";
import AssistantFAB from "../assistant/AssistantFAB";
import InventoryScanner from "../inventory/InventoryScanner/InventoryScanner";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { compactView, displayName, avatarUrl, navigationType } =
    useUserContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  const isSidebar = navigationType === "sidebar";
  const drawerWidth = 240;
  const collapsedWidth = 64;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

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
      {isSidebar && isMobile && (
        <MobileAppBar
          mobileOpen={mobileOpen}
          compactView={compactView}
          onToggle={handleDrawerToggle}
        />
      )}

      {isSidebar && (
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
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: compactView
            ? { xs: 1.5, sm: 2, md: 2.5 }
            : { xs: 2, sm: 3, md: 4 },
          pb: isSidebar ? 8 : 12, // More padding at bottom for UserBottomNavigation
          width:
            isSidebar && !isMobile
              ? `calc(100% - ${currentDrawerWidth}px)`
              : "100%",
          mt:
            isSidebar && isMobile
              ? `calc(${compactView ? "48px" : "56px"} + env(safe-area-inset-top))`
              : 0,
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>

      {!isSidebar && (
        <UserBottomNavigation onScanClick={() => setScanOpen(true)} />
      )}

      <InventoryScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={(decodedText) => {
          setScanOpen(false);
          void navigate(
            `/inventory?scanResult=${encodeURIComponent(decodedText)}`
          );
        }}
        onError={(msg) => handleError(new Error(msg), msg)}
      />

      <AssistantFAB />
    </Box>
  );
};

export default Layout;
