import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Paper,
  Stack,
  LinearProgress,
  AppBar,
  Toolbar,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Label as LabelIcon,
  Assignment as HistoryIcon,
  Build as BuildIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../i18n";
import type { Appliance, Repair } from "../../types/appliances";

interface ApplianceDrawerProps {
  open: boolean;
  onClose: () => void;
  appliance: Appliance | null;
  repairs: Repair[];
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
  onAddRepair: (appliance: Appliance) => void;
}

const ApplianceDrawer: React.FC<ApplianceDrawerProps> = ({
  open,
  onClose,
  appliance,
  repairs,
  onEdit,
  onDelete,
  onAddRepair,
}) => {
  const { t } = useTranslation();

  if (!appliance) return null;

  const getStatusColor = () => {
    switch (appliance.status) {
      case "broken":
        return "error";
      case "needs_service":
        return "warning";
      default:
        return "success";
    }
  };

  const getStatusIcon = () => {
    switch (appliance.status) {
      case "broken":
        return <ErrorIcon />;
      case "needs_service":
        return <WarningIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const calculateWarrantyProgress = () => {
    if (!appliance.purchase_date || !appliance.warranty_expiry) return 100;
    const start = new Date(appliance.purchase_date).getTime();
    const end = new Date(appliance.warranty_expiry).getTime();
    const now = new Date().getTime();
    const total = end - start;
    if (total <= 0) return 0;
    const elapsed = now - start;
    const progress = (1 - elapsed / total) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const isWarrantyExpired = () => {
    if (!appliance.warranty_expiry) return false;
    return new Date(appliance.warranty_expiry) < new Date();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: "100%", sm: 500 }, bgcolor: "background.default" },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            backdropFilter: "blur(20px)",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(18, 18, 18, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              {appliance.name}
            </Typography>
            <IconButton onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3 } }}>
          {appliance.photo_url ? (
            <Paper
              elevation={4}
              sx={{
                width: "100%",
                height: 250,
                borderRadius: 4,
                overflow: "hidden",
                mb: 3,
                backgroundImage: `url(${appliance.photo_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 120,
                borderRadius: 4,
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <InventoryIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            </Box>
          )}

          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 3 }}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              icon={getStatusIcon()}
              label={t(`appliances.status.${appliance.status || "functional"}`)}
              color={getStatusColor()}
              variant="filled"
              sx={{ fontWeight: "bold" }}
            />
            {appliance.sku && (
              <Chip
                icon={<LabelIcon />}
                label={appliance.sku}
                variant="outlined"
              />
            )}
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight="bold"
              >
                {t("appliances.warranty.title")}
              </Typography>
              <Typography
                variant="caption"
                color={isWarrantyExpired() ? "error.main" : "success.main"}
                fontWeight="bold"
              >
                {isWarrantyExpired()
                  ? t("appliances.warranty.expired")
                  : t("appliances.warranty.active")}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calculateWarrantyProgress()}
              color={isWarrantyExpired() ? "error" : "success"}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                {appliance.purchase_date || "—"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {appliance.warranty_expiry || "—"}
              </Typography>
            </Box>
          </Paper>

          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <InventoryIcon fontSize="small" color="primary" />{" "}
            {t("common.details") || "Specifications"}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              {
                label: t("appliances.brand"),
                value: appliance.brand,
                key: "brand",
              },
              {
                label: t("appliances.model"),
                value: appliance.model,
                key: "model",
              },
              {
                label: t("appliances.serialLabel"),
                value: appliance.serial_number,
                key: "serial",
              },
              {
                label: t("appliances.expectedLife"),
                value: appliance.expected_life
                  ? `${appliance.expected_life} ${t("common.years") || "Years"}`
                  : "—",
                key: "life",
              },
              {
                label: t("appliances.locationLabel"),
                value: appliance.location,
                key: "loc",
              },
            ].map((spec) => (
              <Grid size={6} key={spec.key}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {spec.label}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {spec.value || "—"}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <HistoryIcon fontSize="small" color="primary" />{" "}
              {t("appliances.history")}
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onAddRepair(appliance)}
              variant="outlined"
            >
              {t("appliances.addRepair")}
            </Button>
          </Box>

          {repairs.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: "action.hover",
                borderRadius: 3,
              }}
            >
              <BuildIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t("appliances.noRepairs")}
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {repairs.map((repair) => (
                <Paper
                  key={repair.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 3 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {repair.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {repair.repair_date}
                    </Typography>
                  </Box>
                  {repair.parts && repair.parts.length > 0 && (
                    <Box
                      sx={{
                        pl: 1,
                        borderLeft: "2px solid",
                        borderColor: "primary.main",
                        my: 1.5,
                      }}
                    >
                      {repair.parts.map((part) => (
                        <Box
                          key={part.id || part.name}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {part.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {part.price.toFixed(2)} $
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                      {repair.service_provider}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {(repair.parts || [])
                        .reduce((s, p) => s + (p.price || 0), 0)
                        .toFixed(2)}{" "}
                      $
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => onEdit(appliance)}
          >
            {t("appliances.edit")}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (appliance.id) onDelete(appliance.id);
            }}
          >
            {t("appliances.delete")}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ApplianceDrawer;
