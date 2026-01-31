import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n";

interface UserProfileProps {
  displayName: string | null;
  avatarUrl: string | null;
  collapsed: boolean;
  isMobile: boolean;
  compactView: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  displayName,
  avatarUrl,
  collapsed,
  isMobile,
  compactView,
}) => {
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    return "U";
  };

  return (
    <Box
      sx={{
        px: collapsed && !isMobile ? 0 : 2,
        py: compactView ? 1.5 : 2,
        display: "flex",
        justifyContent: collapsed && !isMobile ? "center" : "flex-start",
        alignItems: "center",
        gap: 2,
        overflow: "hidden",
      }}
    >
      <Avatar
        src={avatarUrl || undefined}
        sx={{
          width: collapsed && !isMobile ? 32 : compactView ? 36 : 40,
          height: collapsed && !isMobile ? 32 : compactView ? 36 : 40,
          bgcolor: "primary.main",
          fontSize: "0.875rem",
          flexShrink: 0,
        }}
      >
        {getInitials(displayName || "")}
      </Avatar>
      <AnimatePresence mode="wait">
        {(!collapsed || isMobile) && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}
          >
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
      </AnimatePresence>
    </Box>
  );
};

export default UserProfile;
