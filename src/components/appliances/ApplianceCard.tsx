import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  CardMedia,
  Button,
  Checkbox,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Build as BuildIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as HealthyIcon,
  Error as BrokenIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { Appliance } from "../../types/appliances";

interface ApplianceCardProps {
  appliance: Appliance;
  compactView: boolean;
  selected: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onViewRepairs: (appliance: Appliance) => void;
  onAddRepair: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
}

const ApplianceCard: React.FC<ApplianceCardProps> = ({
  appliance,
  compactView,
  selected,
  onToggle,
  onViewRepairs,
  onAddRepair,
  onDelete,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (appliance.status) {
      case "needs_service":
        return {
          label: t("appliances.status.needsService") || "Needs Service",
          color: theme.palette.warning.main,
          icon: <WarningIcon sx={{ fontSize: 16 }} />,
        };
      case "broken":
        return {
          label: t("appliances.status.broken") || "Broken",
          color: theme.palette.error.main,
          icon: <BrokenIcon sx={{ fontSize: 16 }} />,
        };
      default:
        return {
          label: t("appliances.status.functional") || "Functional",
          color: theme.palette.primary.main,
          icon: <HealthyIcon sx={{ fontSize: 16 }} />,
        };
    }
  };

  const status = getStatusConfig();

  const calculateWarranty = () => {
    if (!appliance.purchase_date || !appliance.warranty_expiry) return null;
    const start = new Date(appliance.purchase_date).getTime();
    const end = new Date(appliance.warranty_expiry).getTime();
    const now = new Date().getTime();

    if (now >= end)
      return {
        progress: 0,
        label: t("appliances.warranty.expired") || "Expired",
      };

    const total = end - start;
    const remaining = end - now;
    const progress = Math.max(0, Math.min(100, (remaining / total) * 100));

    const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    const label =
      daysLeft < 30
        ? t("appliances.warranty.expiringSoon", { days: daysLeft }) ||
          `Expiring in ${daysLeft}d`
        : t("appliances.warranty.active") || "Active";

    return { progress, label, daysLeft };
  };

  const warranty = calculateWarranty();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px -10px ${alpha(theme.palette.common.black, 0.3)}`,
          borderColor: "primary.main",
          "& .hero-image": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Checkbox
          checked={selected}
          onChange={(e) => onToggle(appliance.id, e.target.checked)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(4px)",
            "&:hover": { bgcolor: theme.palette.background.paper },
            borderRadius: 1,
            p: 0.5,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 2,
            display: "flex",
            gap: 1,
          }}
        >
          <Chip
            label={status.label}
            size="small"
            icon={status.icon}
            sx={{
              bgcolor: alpha(status.color, 0.1),
              color: status.color,
              borderColor: alpha(status.color, 0.2),
              border: "1px solid",
              fontWeight: "bold",
              backdropFilter: "blur(4px)",
            }}
          />
        </Box>

        <Box sx={{ overflow: "hidden", height: compactView ? 140 : 180 }}>
          <CardMedia
            component="img"
            image={appliance.photo_url || "/appliance-placeholder.svg"}
            className="hero-image"
            sx={{
              height: "100%",
              width: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
              filter: appliance.photo_url
                ? "none"
                : "grayscale(1) opacity(0.3)",
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: compactView ? 2 : 3, flexGrow: 1 }}>
        <Typography
          variant={compactView ? "subtitle1" : "h6"}
          fontWeight="bold"
          gutterBottom
          noWrap
        >
          {appliance.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography
            variant="caption"
            color="text.primary"
            sx={{
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {appliance.brand}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            •
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: "medium" }}
          >
            {appliance.type}
          </Typography>
        </Box>

        {warranty && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
              >
                {t("appliances.warranty.title") || "Warranty"}
              </Typography>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  color: warranty.progress < 20 ? "error.main" : "text.primary",
                  bgcolor:
                    warranty.progress < 20
                      ? alpha(theme.palette.error.main, 0.1)
                      : "transparent",
                  px: warranty.progress < 20 ? 0.5 : 0,
                  borderRadius: 0.5,
                }}
              >
                {warranty.label}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={warranty.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.divider, 0.1),
                "& .MuiLinearProgress-bar": {
                  bgcolor:
                    warranty.progress < 20 ? "error.main" : "primary.main",
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {appliance.location && (
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "text.primary",
              fontWeight: "medium",
            }}
          >
            <Box
              component="span"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              @
            </Box>{" "}
            {appliance.location}
          </Typography>
        )}
      </CardContent>

      <CardActions
        sx={{
          p: 1.5,
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.default, 0.8)
              : alpha(theme.palette.action.hover, 0.9),
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          size="small"
          startIcon={<HistoryIcon />}
          onClick={() => onViewRepairs(appliance)}
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          {t("appliances.history")}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          size="small"
          color="primary"
          onClick={() => onAddRepair(appliance)}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
          }}
        >
          <BuildIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(appliance.id)}
          sx={{
            bgcolor: alpha(theme.palette.error.main, 0.05),
            "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.15) },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ApplianceCard;
