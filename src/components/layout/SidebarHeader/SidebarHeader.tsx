import React from "react";
import { Box, Typography, IconButton, Toolbar } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n";

interface SidebarHeaderProps {
  collapsed: boolean;
  isMobile: boolean;
  compactView: boolean;
  onToggle: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  collapsed,
  isMobile,
  compactView,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <Toolbar
      data-testid="drawer-header"
      disableGutters
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed && !isMobile ? "center" : "space-between",
        px: collapsed && !isMobile ? 0 : 2,
        minHeight: compactView ? "48px !important" : "64px !important",
      }}
    >
      <Box
        sx={{
          display: collapsed && !isMobile ? "none" : "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
          mr: 1,
        }}
      >
        <Box
          component="img"
          src="/icons/icon.svg"
          sx={{
            width: compactView ? 24 : 32,
            height: compactView ? 24 : 32,
            mr: 1,
            flexShrink: 0,
          }}
          alt="Logo"
        />
        {(!collapsed || isMobile) && (
          <Typography
            variant={compactView ? "body1" : "h6"}
            component="div"
            noWrap
            sx={{
              color: "brand.primary",
              lineHeight: 1.2,
              minWidth: 0,
            }}
          >
            {t("app.title")}
          </Typography>
        )}
      </Box>
      <IconButton
        onClick={onToggle}
        size={compactView ? "small" : "medium"}
        aria-label={
          isMobile ? "close menu" : collapsed ? "expand menu" : "collapse menu"
        }
        data-testid="close-menu-button"
        sx={{
          color: "brand.primary",
          flexShrink: 0,
          width: compactView ? 32 : 40,
          height: compactView ? 32 : 40,
          p: 0,
          m: 0,
          "&:hover": { bgcolor: "navigation.itemActiveBackground" },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isMobile ? "close" : collapsed ? "menu" : "chevron"}
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex" }}
          >
            {isMobile ? (
              <CloseIcon />
            ) : collapsed ? (
              <MenuIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </motion.div>
        </AnimatePresence>
      </IconButton>
    </Toolbar>
  );
};

export default SidebarHeader;
