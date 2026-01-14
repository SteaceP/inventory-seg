import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/useThemeContext";
import { useTranslation } from "../i18n";
import InventoryScanner from "../components/inventory/InventoryScanner";
import BarcodePrinter from "../components/BarcodePrinter";
import { useAlert } from "../contexts/useAlertContext";
import ConfirmDialog from "../components/ConfirmDialog";

// Components
import AppliancesHeader from "../components/appliances/AppliancesHeader";
import ApplianceCard from "../components/appliances/ApplianceCard";
import ApplianceDialog from "../components/appliances/ApplianceDialog";
import ApplianceRepairDialog from "../components/appliances/ApplianceRepairDialog";
import ApplianceHistoryDialog from "../components/appliances/ApplianceHistoryDialog";

// Types
import type { Appliance, Repair } from "../types/appliances";

const Appliances: React.FC = () => {
  const { compactView } = useThemeContext();
  const { t } = useTranslation();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(
    null
  );
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loadingRepairs, setLoadingRepairs] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showError } = useAlert();

  // Modal states
  const [openAddAppliance, setOpenAddAppliance] = useState(false);
  const [openAddRepair, setOpenAddRepair] = useState(false);
  const [openRepairsList, setOpenRepairsList] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [applianceToDelete, setApplianceToDelete] = useState<string | null>(
    null
  );

  async function fetchAppliances() {
    setLoading(true);
    const { data, error } = await supabase
      .from("appliances")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showError(t("appliances.errorFetching") + ": " + error.message);
    } else if (data) {
      setAppliances(data as Appliance[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void fetchAppliances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRepairs = async (applianceId: string) => {
    setLoadingRepairs(true);
    const { data, error } = await supabase
      .from("repairs")
      .select("*")
      .eq("appliance_id", applianceId)
      .order("repair_date", { ascending: false });

    if (error) {
      showError(t("appliances.errorFetchingRepairs") + ": " + error.message);
    } else if (data) {
      setRepairs(data);
    }
    setLoadingRepairs(false);
  };

  const handleCreateAppliance = async (newAppliance: Partial<Appliance>) => {
    try {
      setActionLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        showError(t("appliances.userNotLoggedIn"));
        return;
      }

      const { error } = await supabase
        .from("appliances")
        .insert([{ ...newAppliance, user_id: user.id }]);

      if (error) {
        showError(t("appliances.errorCreating") + ": " + error.message);
      } else {
        setOpenAddAppliance(false);
        void fetchAppliances();
      }
    } catch (err: unknown) {
      showError(t("appliances.errorCreating") + ": " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRepair = async (newRepair: Partial<Repair>) => {
    if (!selectedAppliance) {
      showError(t("appliances.noApplianceSelected"));
      return;
    }

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from("repairs")
        .insert([{ ...newRepair, appliance_id: selectedAppliance.id }]);

      if (error) {
        showError(t("appliances.errorCreatingRepair") + ": " + error.message);
      } else {
        setOpenAddRepair(false);
        void fetchRepairs(selectedAppliance.id);
      }
    } catch (err: unknown) {
      showError(
        t("appliances.errorCreatingRepair") + ": " + (err as Error).message
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setApplianceToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!applianceToDelete) return;
    const id = applianceToDelete;
    setDeleteConfirmOpen(false);
    setApplianceToDelete(null);

    try {
      setActionLoading(true);
      const { error } = await supabase.from("appliances").delete().eq("id", id);
      if (error) {
        showError(t("appliances.errorDeleting") + ": " + error.message);
      } else {
        void fetchAppliances();
      }
    } catch (err: unknown) {
      showError(t("appliances.errorDeleting") + ": " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewRepairs = (appliance: Appliance) => {
    setSelectedAppliance(appliance);
    void fetchRepairs(appliance.id);
    setOpenRepairsList(true);
  };

  const handleScanSuccess = (decodedText: string) => {
    setScanOpen(false);
    const appliance = appliances.find((a) => a.sku === decodedText);

    if (appliance) {
      handleViewRepairs(appliance);
    } else {
      // Logic for adding might need more than just SKU
      // For now, just open the dialog (it could be pre-filled if we had simpler state)
      setOpenAddAppliance(true);
    }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(appliances.map((a) => a.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const toggleItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  return (
    <Box sx={{ p: compactView ? 2 : 3 }}>
      <AppliancesHeader
        compactView={compactView}
        selectedCount={selectedItems.size}
        onPrintLabels={handlePrint}
        onScan={() => setScanOpen(true)}
        onAddAppliance={() => setOpenAddAppliance(true)}
      />

      <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
        <FormControlLabel
          control={
            <Checkbox
              indeterminate={
                selectedItems.size > 0 && selectedItems.size < appliances.length
              }
              checked={
                appliances.length > 0 &&
                selectedItems.size === appliances.length
              }
              onChange={(e) => toggleAll(e.target.checked)}
            />
          }
          label={t("common.selectAll") || "Select All"}
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={compactView ? 2 : 3}>
          {appliances.map((appliance) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={appliance.id}>
              <ApplianceCard
                appliance={appliance}
                compactView={compactView}
                selected={selectedItems.has(appliance.id)}
                onToggle={toggleItem}
                onViewRepairs={handleViewRepairs}
                onAddRepair={(app) => {
                  setSelectedAppliance(app);
                  setOpenAddRepair(true);
                }}
                onDelete={(id) => handleDeleteClick(id)}
                onPrint={(id) => {
                  setSelectedItems(new Set([id]));
                  setTimeout(() => handlePrint(), 0);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t("appliances.delete") || "Delete Appliance"}
        content={t("appliances.deleteConfirm")}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <ApplianceDialog
        open={openAddAppliance}
        onClose={() => setOpenAddAppliance(false)}
        onSave={(newApp) => void handleCreateAppliance(newApp)}
        loading={actionLoading}
      />

      <ApplianceRepairDialog
        open={openAddRepair}
        onClose={() => setOpenAddRepair(false)}
        onSave={(newRepair) => void handleCreateRepair(newRepair)}
        appliance={selectedAppliance}
        loading={actionLoading}
      />

      <ApplianceHistoryDialog
        open={openRepairsList}
        onClose={() => setOpenRepairsList(false)}
        appliance={selectedAppliance}
        repairs={repairs}
        loading={loadingRepairs}
      />

      {/* Utilities */}
      <BarcodePrinter
        items={appliances
          .filter((a) => selectedItems.has(a.id))
          .map((a) => ({
            name: a.name,
            sku: a.sku || "",
            category: a.type,
          }))}
      />

      <InventoryScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={(msg) => showError(t("inventory.scanError") + ": " + msg)}
      />
    </Box>
  );
};

export default Appliances;
