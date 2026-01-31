import React, { useState, useEffect } from "react";
import {
  Fab,
  Drawer,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { AutoAwesome as SparklesIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import ChatInterface from "./ChatInterface";
import { useTranslation } from "@/i18n";

const AssistantFAB: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("assistant-fab-visible") !== "false";
  });
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsVisible(localStorage.getItem("assistant-fab-visible") !== "false");
    };

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
              dragConstraints={{ left: -300, right: 0, top: -608, bottom: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Tooltip title={t("menu.assistant")} placement="left">
                <Fab
                  color="primary"
                  aria-label="assistant"
                  onClick={() => setOpen(true)}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    boxShadow: theme.shadows[6],
                    "&:hover": {
                      boxShadow: theme.shadows[10],
                    },
                  }}
                  component={motion.button}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SparklesIcon fontSize={isMobile ? "small" : "medium"} />
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
