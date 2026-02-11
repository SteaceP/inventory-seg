import React from "react";

// Components

// Types & Hooks

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import KitchenIcon from "@mui/icons-material/Kitchen";

import { useTranslation } from "@/i18n";
import type { ApplianceStatus } from "@/types/appliances";

import ApplianceCard from "@components/appliances/ApplianceCard/ApplianceCard";
import ApplianceDialog from "@components/appliances/ApplianceDialog/ApplianceDialog";
import ApplianceDrawer from "@components/appliances/ApplianceDrawer/ApplianceDrawer";
import ApplianceRepairDialog from "@components/appliances/ApplianceRepairDialog/ApplianceRepairDialog";
import AppliancesHeader from "@components/appliances/AppliancesHeader";
import AppliancesStats from "@components/appliances/AppliancesStats";
import BarcodePrinter from "@components/BarcodePrinter";
import ConfirmDialog from "@components/ConfirmDialog";
import InventoryScanner from "@components/inventory/InventoryScanner/InventoryScanner";
import { useUserContext } from "@contexts/UserContext";
import { useApplianceManagement } from "@hooks/useApplianceManagement";
import { useErrorHandler } from "@hooks/useErrorHandler";

const Appliances: React.FC = () => {
  const { compactView } = useUserContext();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const {
    appliances,
    filteredAppliances,
    loading,
    actionLoading,
    filter,
    setFilter,
    selectedItems,
    selectedAppliance,
    setSelectedAppliance,
    repairs,
    dialogs,
    actions,
  } = useApplianceManagement();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ p: compactView ? 2 : 3 }}>
      <AppliancesHeader
        compactView={compactView}
        selectedCount={selectedItems.size}
        onPrintLabels={handlePrint}
        onScan={() => dialogs.setScanOpen(true)}
        onAddAppliance={() => dialogs.setOpenAddAppliance(true)}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <AppliancesStats appliances={appliances} compactView={compactView} />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mb: 3,
            }}
          >
            <Tabs
              value={filter}
              onChange={(_, val: ApplianceStatus | "all") => setFilter(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: { xs: 1, sm: 0 },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: "bold",
                  minWidth: 100,
                },
              }}
            >
              <Tab
                label={t("appliances.filter.all") || "All Units"}
                value="all"
              />
              <Tab
                label={t("appliances.filter.operational") || "Operational"}
                value="functional"
              />
              <Tab
                label={t("appliances.filter.serviceNeeded") || "Service Needed"}
                value="needs_service"
              />
              <Tab
                label={t("appliances.filter.broken") || "Broken"}
                value="broken"
              />
            </Tabs>

            <FormControlLabel
              control={
                <Checkbox
                  indeterminate={
                    selectedItems.size > 0 &&
                    selectedItems.size < filteredAppliances.length
                  }
                  checked={
                    filteredAppliances.length > 0 &&
                    selectedItems.size === filteredAppliances.length
                  }
                  onChange={(e) =>
                    actions.toggleAll(e.target.checked, filteredAppliances)
                  }
                />
              }
              label={t("common.selectAll") || "Select All"}
            />
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={compactView ? 2 : 3}>
            {filteredAppliances.map((appliance) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={appliance.id}>
                <ApplianceCard
                  appliance={appliance}
                  compactView={compactView}
                  selected={selectedItems.has(appliance.id)}
                  onToggle={actions.toggleItem}
                  onViewRepairs={actions.handleViewDetails}
                  onAddRepair={(app) => {
                    setSelectedAppliance(app);
                    dialogs.setOpenAddRepair(true);
                  }}
                  onDelete={(id) => actions.handleDeleteClick(id)}
                />
              </Grid>
            ))}
          </Grid>

          {filteredAppliances.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {appliances.length === 0 ? (
                <>
                  <KitchenIcon
                    sx={{
                      fontSize: 64,
                      mb: 2,
                      color: "primary.main",
                      opacity: 0.8,
                    }}
                  />
                  <Typography variant="h5" color="text.primary" gutterBottom>
                    {t("appliances.empty") || "Your appliance list is empty"}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => dialogs.setOpenAddAppliance(true)}
                    sx={{
                      mt: 2,
                      bgcolor: "primary.main",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    {t("appliances.add") || "Add Appliance"}
                  </Button>
                </>
              ) : (
                <>
                  <FilterListIcon
                    sx={{
                      fontSize: 64,
                      mb: 2,
                      color: "text.secondary",
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    {t("appliances.noAppliancesFound") ||
                      "No appliances found matching your filter."}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={dialogs.deleteConfirmOpen}
        title={t("appliances.delete")}
        content={t("appliances.deleteConfirm")}
        onConfirm={() => void actions.handleDeleteConfirm()}
        onCancel={() => dialogs.setDeleteConfirmOpen(false)}
      />

      <ApplianceDialog
        open={dialogs.openAddAppliance}
        onClose={() => dialogs.setOpenAddAppliance(false)}
        onSave={(newApp) => void actions.handleCreateAppliance(newApp)}
        loading={actionLoading}
      />

      <ApplianceDialog
        open={dialogs.openEditAppliance}
        onClose={() => dialogs.setOpenEditAppliance(false)}
        initialData={selectedAppliance || {}}
        onSave={(updated) => void actions.handleUpdateAppliance(updated)}
        loading={actionLoading}
      />

      <ApplianceRepairDialog
        open={dialogs.openAddRepair}
        onClose={() => dialogs.setOpenAddRepair(false)}
        onSave={(newRepair) => void actions.handleCreateRepair(newRepair)}
        appliance={selectedAppliance}
        loading={actionLoading}
      />

      <ApplianceDrawer
        open={dialogs.openDrawer}
        onClose={() => dialogs.setOpenDrawer(false)}
        appliance={selectedAppliance}
        repairs={repairs}
        onEdit={(app) => {
          setSelectedAppliance(app);
          dialogs.setOpenEditAppliance(true);
        }}
        onDelete={(id) => actions.handleDeleteClick(id)}
        onAddRepair={(app) => {
          setSelectedAppliance(app);
          dialogs.setOpenAddRepair(true);
        }}
      />

      {/* Utilities */}
      <BarcodePrinter
        items={appliances
          .filter((a) => selectedItems.has(a.id))
          .map((a) => ({
            name: a.name,
            sku: a.sku || "",
            category: a.type || "",
          }))}
      />

      <InventoryScanner
        open={dialogs.scanOpen}
        onClose={() => dialogs.setScanOpen(false)}
        onScanSuccess={actions.handleScanSuccess}
        onError={(msg) =>
          handleError(new Error(msg), t("inventory.scanError") || "Scan error")
        }
      />
    </Box>
  );
};

export default Appliances;
