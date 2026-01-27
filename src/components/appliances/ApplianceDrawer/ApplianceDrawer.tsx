import React from "react";
import { Drawer, Box, Chip, Paper, Stack } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Label as LabelIcon,
} from "@mui/icons-material";
import { useTranslation } from "@/i18n";
import type { Appliance, Repair } from "@/types/appliances";
import ApplianceDrawerHeader from "./ApplianceDrawerHeader";
import ApplianceWarrantyCard from "./ApplianceWarrantyCard";
import ApplianceDetailsGrid from "./ApplianceDetailsGrid";
import ApplianceRepairHistory from "./ApplianceRepairHistory";
import ApplianceActionButtons from "./ApplianceActionButtons";

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
        <ApplianceDrawerHeader name={appliance.name} onClose={onClose} />

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

          <ApplianceWarrantyCard appliance={appliance} />
          <ApplianceDetailsGrid appliance={appliance} />
          <ApplianceRepairHistory
            appliance={appliance}
            repairs={repairs}
            onAddRepair={onAddRepair}
          />
        </Box>

        <ApplianceActionButtons
          appliance={appliance}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Box>
    </Drawer>
  );
};

export default ApplianceDrawer;
