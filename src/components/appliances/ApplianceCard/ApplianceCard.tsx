import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Checkbox,
  CardMedia,
  alpha,
  useTheme,
} from "@mui/material";
import type { Appliance } from "@/types/appliances";
import ApplianceStatusChip from "./ApplianceStatusChip";
import ApplianceWarrantyProgress from "./ApplianceWarrantyProgress";
import ApplianceCardActions from "./ApplianceCardActions";

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
  const theme = useTheme();

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
          <ApplianceStatusChip status={appliance.status || "functional"} />
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

        <ApplianceWarrantyProgress appliance={appliance} />

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

      <ApplianceCardActions
        appliance={appliance}
        onViewRepairs={onViewRepairs}
        onAddRepair={onAddRepair}
        onDelete={onDelete}
      />
    </Card>
  );
};

export default ApplianceCard;
