import React, { useState } from "react";
import {
  Fab,
  Drawer,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { SmartToy as RobotIcon, Close as CloseIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import ChatInterface from "./ChatInterface";
import { useTranslation } from "@/i18n";

const AssistantFAB: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Tooltip title={t("menu.assistant")} placement="left">
        <Fab
          color="primary"
          aria-label="assistant"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: theme.zIndex.drawer + 1,
            boxShadow: theme.shadows[10],
            opacity: open ? 0 : 1,
            pointerEvents: open ? "none" : "auto",
            transition: "opacity 0.3s ease",
            "&:hover": {
              boxShadow: theme.shadows[20],
            },
          }}
          component={motion.button}
          whileHover={!open ? "hover" : undefined}
          whileTap={!open ? { scale: 0.9 } : undefined}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: open ? 0 : 1 }}
        >
          <motion.div
            variants={{
              hover: {
                rotate: [0, -10, 10, -10, 10, 0],
                scale: 1.2,
                transition: { duration: 0.5 },
              },
            }}
          >
            <RobotIcon />
          </motion.div>
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
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
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 1,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              "&:hover": {
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <ChatInterface />
        </Box>
      </Drawer>
    </>
  );
};

export default AssistantFAB;
