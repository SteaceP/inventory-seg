import React from "react";

import { motion, AnimatePresence } from "framer-motion";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

import { useTranslation } from "@/i18n";

interface MobileAppBarProps {
  mobileOpen: boolean;
  compactView: boolean;
  onToggle: () => void;
}

const MobileAppBar: React.FC<MobileAppBarProps> = ({
  mobileOpen,
  compactView,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
        background: (theme) =>
          theme.palette.mode === "dark" ? "rgba(22, 27, 34, 0.8)" : "#ffffff",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: {
            xs: `calc(${compactView ? "48px" : "56px"} + env(safe-area-inset-top)) !important`,
            sm: `${compactView ? "48px" : "64px"} !important`,
          },
          px: {
            xs: `calc(8px + env(safe-area-inset-left))`,
            sm: 2,
          },
          pt: { xs: "env(safe-area-inset-top)", sm: 0 },
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onToggle}
          sx={{
            mr: { xs: 1, sm: 2 },
            ml: { xs: 0.5, sm: 0 },
            color: "primary.main",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileOpen ? "close" : "menu"}
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex" }}
            >
              {mobileOpen ? (
                <CloseIcon />
              ) : (
                <MenuIcon fontSize={compactView ? "small" : "medium"} />
              )}
            </motion.div>
          </AnimatePresence>
        </IconButton>
        <Box
          component="img"
          src="/icons/icon.svg"
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
          component="div"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            flexGrow: 1,
            minWidth: 0,
            lineHeight: 1.2,
            whiteSpace: "normal",
          }}
        >
          {t("app.menuTitle").toUpperCase()}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default MobileAppBar;
