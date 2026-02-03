import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatInterface from "./ChatInterface";
import { useTranslation } from "@/i18n";

import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import Fab from "@mui/material/Fab";
import SparklesIcon from "@mui/icons-material/AutoAwesome";

const AssistantFAB: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("assistant-fab-visible") !== "false";
  });
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [dragConstraints, setDragConstraints] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });

  useEffect(() => {
    const updateConstraints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Calculate constraints based on device size
      // We want to allow movement but keep it somewhat anchored
      // FAB default position is bottom-right

      let constraints;

      if (width > 1200) {
        // Desktop: High freedom
        // Allow moving almost anywhere, but keep 100px margins
        constraints = {
          left: -(width - 150), // Move left almost full width
          right: 0,
          top: -(height - 150), // Move up almost full height
          bottom: 0,
        };
      } else if (width > 600) {
        // Tablet: Moderate freedom
        // Allow moving in bottom-right quadrant or 75% width
        constraints = {
          left: -(width * 0.75),
          right: 0,
          top: -(height * 0.75),
          bottom: 0,
        };
      } else {
        // Mobile: Restricted
        // Keep it from blocking header/footer too much
        constraints = {
          left: -300,
          right: 0,
          top: -600,
          bottom: 0,
        };
      }

      setDragConstraints(constraints);
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);

    return () => {
      window.removeEventListener("resize", updateConstraints);
    };
  }, []);

  const handleStorageChange = () => {
    setIsVisible(localStorage.getItem("assistant-fab-visible") !== "false");
  };

  useEffect(() => {
    window.addEventListener("assistant-visibility-change", handleStorageChange);
    // Also listen to storage events for cross-tab sync
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "assistant-visibility-change",
        handleStorageChange
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: theme.zIndex.drawer + 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          pointerEvents: open ? "none" : "auto", // Allow interactions only when closed
        }}
      >
        <AnimatePresence>
          {!open && (
            <motion.div
              drag
              dragMomentum={false}
              dragConstraints={dragConstraints}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Tooltip title={t("menu.assistant")} placement="left">
                <Fab
                  aria-label="assistant"
                  onClick={() => setOpen(true)}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    bgcolor: "assistant.fabBackground",
                    color: "assistant.sparkle",
                    boxShadow: theme.shadows[6],
                    "&:hover": {
                      bgcolor: "assistant.fabHover",
                      boxShadow: theme.shadows[10],
                    },
                  }}
                  component={motion.button}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SparklesIcon
                    fontSize={isMobile ? "small" : "medium"}
                    sx={{ color: "inherit" }}
                  />
                </Fab>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
        container={typeof document !== "undefined" ? document.body : undefined}
        PaperProps={{
          sx: {
            width: isMobile ? "100%" : 400,
            height: "100%",
            borderRadius: isMobile ? 0 : "20px 0 0 20px",
            overflow: "hidden",
            boxShadow: theme.shadows[24],
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Box sx={{ position: "relative", height: "100%" }}>
          <ChatInterface onClose={() => setOpen(false)} />
        </Box>
      </Drawer>
    </>
  );
};

export default AssistantFAB;
