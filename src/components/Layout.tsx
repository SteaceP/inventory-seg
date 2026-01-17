import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Toolbar,
  IconButton,
  Tooltip,
  AppBar,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Avatar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Kitchen as AppliancesIcon,
  History as ActivityIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/ThemeContext";
import { useUserContext } from "../contexts/UserContext";
import { useTranslation } from "../i18n";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { compactView } = useThemeContext();
  const { displayName, avatarUrl } = useUserContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { t } = useTranslation();

  const drawerWidth = 240;
  const collapsedWidth = 64;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getInitials = (name: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    return "U";
  };

  const menuItems = [
    { text: t("menu.dashboard"), icon: <DashboardIcon />, path: "/" },
    {
      text: t("menu.inventory"),
      icon: (
        <Box
          component="img"
          src="/icon.svg"
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
      icon: <AppliancesIcon />,
      path: "/appliances",
    },
    // Keep Settings last in this section
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

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "space-between",
          px: [1],
          minHeight: compactView ? "48px !important" : "64px !important",
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            <Box
              component="img"
              src="/icon.svg"
              sx={{
                width: compactView ? 24 : 32,
                height: compactView ? 24 : 32,
                mr: 1,
              }}
              alt="Logo"
            />
            <Typography
              variant={compactView ? "body1" : "h6"}
              noWrap
              component="div"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              {t("app.title")}
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: "primary.main", p: compactView ? 0.5 : 1 }}
          >
            {collapsed ? (
              <MenuIcon fontSize={compactView ? "small" : "medium"} />
            ) : (
              <ChevronLeftIcon fontSize={compactView ? "small" : "medium"} />
            )}
          </IconButton>
        )}
      </Toolbar>

      <Box
        sx={{
          px: 2,
          py: compactView ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          overflow: "hidden",
        }}
      >
        <Avatar
          src={avatarUrl}
          sx={{
            width: collapsed && !isMobile ? 32 : compactView ? 36 : 40,
            height: collapsed && !isMobile ? 32 : compactView ? 36 : 40,
            bgcolor: "primary.main",
            fontSize: "0.875rem",
            flexShrink: 0,
          }}
        >
          {getInitials(displayName)}
        </Avatar>
        {(!collapsed || isMobile) && (
          <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {displayName || t("user.default")}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              display="block"
            >
              {t("user.online")}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: "divider" }} />

      <Box sx={{ overflow: "auto", mt: compactView ? 1 : 2 }}>
        <List dense={compactView}>
          {menuItems.map((item) => (
            <Tooltip
              key={item.text}
              title={collapsed && !isMobile ? item.text : ""}
              placement="right"
            >
              <ListItemButton
                onClick={() => {
                  void navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: "8px",
                  mb: 0.5,
                  px: collapsed && !isMobile ? 1.5 : 2,
                  py: compactView ? 0.5 : 1,
                  justifyContent: collapsed && !isMobile ? "center" : "initial",
                  "&.Mui-selected": {
                    bgcolor: "rgba(2, 125, 111, 0.1)",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "rgba(2, 125, 111, 0.2)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "text.secondary",
                    opacity: location.pathname === item.path ? 1 : 0.7,
                    minWidth: 0,
                    mr: collapsed && !isMobile ? 0 : 2,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: compactView ? "0.8125rem" : "0.875rem",
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
        <Divider sx={{ my: compactView ? 1 : 2, borderColor: "divider" }} />
        <List dense={compactView}>
          <Tooltip
            title={collapsed && !isMobile ? t("security.signOut") : ""}
            placement="right"
          >
            <ListItemButton
              sx={{
                mx: 1,
                borderRadius: "8px",
                px: collapsed && !isMobile ? 1.5 : 2,
                py: compactView ? 0.5 : 1,
                justifyContent: collapsed && !isMobile ? "center" : "initial",
              }}
              onClick={() => {
                void (async () => {
                  await supabase.auth.signOut();
                  void navigate("/login");
                  if (isMobile) setMobileOpen(false);
                })();
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 0,
                  mr: collapsed && !isMobile ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                <LogoutIcon fontSize={compactView ? "small" : "medium"} />
              </ListItemIcon>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={t("security.signOut")}
                  primaryTypographyProps={{
                    fontSize: compactView ? "0.8125rem" : "0.875rem",
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </List>
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
        <AppBar
          position="fixed"
          sx={{
            width: "100%",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(22, 27, 34, 0.8)"
                : "#ffffff",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Toolbar
            sx={{
              minHeight: compactView ? "48px !important" : "64px !important",
              px: { xs: 1, sm: 2 },
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: { xs: 1, sm: 2 } }}
            >
              <MenuIcon fontSize={compactView ? "small" : "medium"} />
            </IconButton>
            <Box
              component="img"
              src="/icon.svg"
              sx={{
                width: compactView ? 20 : 28,
                height: compactView ? 20 : 28,
                mr: { xs: 0.75, sm: 1.5 },
                flexShrink: 0,
              }}
              alt="Logo"
            />
            <Typography
              variant={compactView ? "body1" : "h6"}
              noWrap
              component="div"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              {t("app.title").toUpperCase()}
            </Typography>
          </Toolbar>
        </AppBar>
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
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                color: "text.primary",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: currentDrawerWidth,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(22, 27, 34, 0.8)"
                    : "#ffffff",
                backdropFilter: "blur(10px)",
                borderRight: "1px solid",
                borderColor: "divider",
                color: "text.primary",
                transition: "width 0.2s ease-in-out",
                overflowX: "hidden",
              },
            }}
          >
            {drawerContent}
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
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          mt: isMobile ? (compactView ? "48px" : "64px") : 0,
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
