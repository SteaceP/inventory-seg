import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  AddBox as AddIcon,
  QrCodeScanner as ScanIcon,
  HomeRepairService as RepairIcon,
  Assessment as ReportIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../i18n";

interface ActionCardProps {
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
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 4,
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
        gap: 1,
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
          width: 48,
          height: 48,
          borderRadius: "12px",
          bgcolor: alpha(color, 0.1),
          color: alpha(color, 0.8),
          transition: "all 0.3s ease",
          mb: 1,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight="900" noWrap>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {description}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: -15,
          right: -15,
          opacity: 0.05,
          transform: "scale(3)",
          color: color,
          pointerEvents: "none",
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

const QuickActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const actions = [
    {
      title: t("inventory.addButton"),
      description: t("dashboard.actions.inventoryDesc"),
      icon: <AddIcon fontSize="large" />,
      color: "#027d6f",
      onClick: () => navigate("/inventory?action=add"),
    },
    {
      title: t("inventory.scan"),
      description: t("dashboard.actions.scanDesc"),
      icon: <ScanIcon fontSize="large" />,
      color: "#1a748b",
      onClick: () => navigate("/inventory?action=scan"),
    },
    {
      title: t("appliances.addAppliance") || t("appliances.add"),
      description: t("dashboard.actions.applianceDesc"),
      icon: <RepairIcon fontSize="large" />,
      color: "#0969da",
      onClick: () => navigate("/appliances?action=add"),
    },
    {
      title: t("inventory.reports") || t("menu.reports"),
      description: t("dashboard.actions.reportDesc"),
      icon: <ReportIcon fontSize="large" />,
      color: "#d29922",
      onClick: () => navigate("/inventory/reports"),
    },
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight="900" sx={{ mb: 2, ml: 0.5 }}>
        {t("dashboard.quickActions")}
      </Typography>
      <Grid container spacing={isMobile ? 1.5 : 2}>
        {actions.map((action) => (
          <Grid size={{ xs: 6, sm: 6, md: 3 }} key={action.title}>
            <ActionCard {...action} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActions;
