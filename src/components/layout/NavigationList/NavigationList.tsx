import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/ExitToApp";

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface NavigationListProps {
  menuItems: NavItem[];
  collapsed: boolean;
  isMobile: boolean;
  compactView: boolean;
  onNavigate: () => void;
}

const NavigationList: React.FC<NavigationListProps> = ({
  menuItems,
  collapsed,
  isMobile,
  compactView,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    void navigate("/login");
    onNavigate();
  };

  return (
    <>
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
                onNavigate();
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
                  bgcolor: "navigation.itemActiveBackground",
                  color: "navigation.itemActiveText",
                  "&:hover": {
                    bgcolor: "navigation.itemActiveBackground",
                    opacity: 0.9,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? "navigation.itemActiveText"
                      : "text.secondary",
                  opacity: location.pathname === item.path ? 1 : 0.7,
                  minWidth: 0,
                  mr: collapsed && !isMobile ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <AnimatePresence mode="wait">
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.text}
                      </motion.span>
                    }
                    primaryTypographyProps={{
                      fontSize: compactView ? "0.8125rem" : "0.875rem",
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                )}
              </AnimatePresence>
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
            onClick={() => void handleLogout()}
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
            <AnimatePresence mode="wait">
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {t("security.signOut")}
                    </motion.span>
                  }
                  primaryTypographyProps={{
                    fontSize: compactView ? "0.8125rem" : "0.875rem",
                  }}
                />
              )}
            </AnimatePresence>
          </ListItemButton>
        </Tooltip>
      </List>
    </>
  );
};

export default NavigationList;
