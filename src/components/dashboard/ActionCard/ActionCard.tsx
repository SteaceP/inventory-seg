import React from "react";
import {
  Paper,
  Typography,
  Box,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: isMobile ? 1.5 : 2.5,
        borderRadius: isMobile ? 3 : 4,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: alpha(color, 0.1),
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(color, 0.05)
            : alpha(color, 0.02),
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 0.5 : 1,
        height: "100%",
        minHeight: isMobile ? "100px" : "auto",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px -10px ${alpha(color, 0.4)}`,
          borderColor: alpha(color, 0.3),
          bgcolor: alpha(color, 0.08),
          "& .action-icon": {
            transform: "scale(1.1) rotate(5deg)",
            color: color,
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
          bgcolor: alpha(color, 0.1),
          color: alpha(color, 0.8),
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
          top: -15,
          right: -15,
          opacity: 0.05,
          transform: isMobile ? "scale(2)" : "scale(3)",
          color: color,
          pointerEvents: "none",
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

export default ActionCard;
