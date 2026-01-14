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
} from "@mui/material";
import {
  Build as BuildIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Print as PrintIcon,
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
  onPrint: (id: string) => void;
}

const ApplianceCard: React.FC<ApplianceCardProps> = ({
  appliance,
  compactView,
  selected,
  onToggle,
  onViewRepairs,
  onAddRepair,
  onDelete,
  onPrint,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: compactView ? 2 : 3,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        transition: "transform 0.2s, box-shadow 0.2s",
        overflow: "hidden",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: compactView ? "translateY(-2px)" : "translateY(-4px)",
          boxShadow: compactView
            ? "0 8px 16px -8px rgba(0, 0, 0, 0.2)"
            : "0 12px 24px -10px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Checkbox
        checked={selected}
        onChange={(e) => onToggle(appliance.id, e.target.checked)}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(0,0,0,0.5)"
              : "rgba(255,255,255,0.7)",
          "&:hover": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.7)"
                : "rgba(255,255,255,0.9)",
          },
        }}
      />
      {appliance.photo_url && (
        <CardMedia
          component="img"
          image={appliance.photo_url}
          alt={appliance.name}
          sx={{
            objectFit: "cover",
            display: "block",
            width: "100%",
            height: {
              xs: compactView ? 140 : 200,
              sm: compactView ? 100 : 140,
            },
          }}
        />
      )}
      <CardContent sx={{ p: compactView ? 1.5 : 2, flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            mb: 1,
          }}
        >
          <Typography
            variant={compactView ? "subtitle1" : "h6"}
            fontWeight="bold"
          >
            {appliance.name}
          </Typography>
          <Chip
            label={appliance.brand}
            size="small"
            sx={{
              bgcolor: "rgba(2, 125, 111, 0.1)",
              color: "primary.main",
              fontWeight: "bold",
              height: compactView ? 20 : 24,
              mr: 4, // Make room for checkbox
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {appliance.type} {appliance.model && `- ${appliance.model}`}
          {appliance.location && (
            <Box component="span" sx={{ color: "text.primary", ml: 1 }}>
              • {appliance.location}
            </Box>
          )}
        </Typography>
        {appliance.sku && (
          <Typography variant="body2" color="primary" fontWeight="bold">
            SKU: {appliance.sku}
          </Typography>
        )}
        {appliance.notes && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
            "{appliance.notes}"
          </Typography>
        )}
      </CardContent>
      <CardActions
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          px: compactView ? 1.5 : 2,
          pb: compactView ? 1.5 : 2,
          gap: 1,
        }}
      >
        <Button
          size={compactView ? "small" : "medium"}
          startIcon={<HistoryIcon />}
          onClick={() => onViewRepairs(appliance)}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {t("appliances.history")}
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            sx={{ p: compactView ? 0.5 : 1 }}
            onClick={() => onPrint(appliance.id)}
            title={t("appliances.printLabel")}
          >
            <PrintIcon />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            sx={{ p: compactView ? 0.5 : 1 }}
            onClick={() => onAddRepair(appliance)}
            title={t("appliances.addRepair")}
          >
            <BuildIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            sx={{ p: compactView ? 0.5 : 1 }}
            onClick={() => onDelete(appliance.id)}
            title={t("appliances.delete")}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ApplianceCard;
