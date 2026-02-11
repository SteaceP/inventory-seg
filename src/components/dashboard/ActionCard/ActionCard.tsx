import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTheme, alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { ActionCardProps } from "@/types/ui";

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Helper to resolve nested palette colors (e.g., "status.success")
  const resolveColor = (path: string) => {
    const parts = path.split(".");
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    let current: any = theme.palette;
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
      } else {
        return path; // Fallback to path itself (e.g. if it's a hex)
      }
    }
    return typeof current === "string" ? current : path;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
  };

  const resolvedColor = resolveColor(color || "primary.main");

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      role="button"
      tabIndex={0}
      sx={{
        p: isMobile ? 1.5 : 2.5,
        borderRadius: isMobile ? 3 : 4,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: alpha(resolvedColor, 0.1),
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(resolvedColor, 0.05)
            : alpha(resolvedColor, 0.02),
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 0.5 : 1,
        height: "100%",
        minHeight: isMobile ? "100px" : "auto",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px -10px ${alpha(resolvedColor, 0.4)}`,
          borderColor: alpha(resolvedColor, 0.3),
          bgcolor: alpha(resolvedColor, 0.08),
          "& .action-icon": {
            transform: "scale(1.1) rotate(5deg)",
            color: resolvedColor,
          },
        },
      }}
    >
      <Box
        className="action-icon"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: isMobile ? 36 : 48,
          height: isMobile ? 36 : 48,
          borderRadius: isMobile ? "8px" : "12px",
          bgcolor: alpha(resolvedColor, 0.1),
          color: alpha(resolvedColor, 0.8),
          transition: "all 0.3s ease",
          mb: isMobile ? 0.5 : 1,
          "& svg": {
            fontSize: isMobile ? "1.25rem" : "2rem",
          },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant={isMobile ? "caption" : "subtitle1"}
          fontWeight="900"
          noWrap
          sx={{ fontSize: isMobile ? "0.7rem" : undefined }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{
            fontSize: isMobile ? "0.625rem" : undefined,
            display: isMobile ? "block" : "block",
          }}
        >
          {description}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 45,
          right: 40,
          opacity: 0.05,
          transform: isMobile ? "scale(2)" : "scale(3)",
          color: resolvedColor,
          pointerEvents: "none",
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

export default ActionCard;
