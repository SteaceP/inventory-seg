import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { useThemeContext } from "../contexts/ThemeContext";
import { useTranslation } from "../i18n";
import InventoryScanner from "../components/inventory/InventoryScanner";
import BarcodePrinter from "../components/BarcodePrinter";
import ConfirmDialog from "../components/ConfirmDialog";

// Components
import AppliancesHeader from "../components/appliances/AppliancesHeader";
import ApplianceCard from "../components/appliances/ApplianceCard";
import ApplianceDialog from "../components/appliances/ApplianceDialog";
import ApplianceRepairDialog from "../components/appliances/ApplianceRepairDialog";
import ApplianceDrawer from "../components/appliances/ApplianceDrawer";
import AppliancesStats from "../components/appliances/AppliancesStats";

// Types
import type { Appliance, Repair, ApplianceStatus } from "../types/appliances";

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
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<ApplianceStatus | "all">("all");
  const { handleError } = useErrorHandler();

  const [openAddAppliance, setOpenAddAppliance] = useState(false);
  const [openEditAppliance, setOpenEditAppliance] = useState(false);
  const [openAddRepair, setOpenAddRepair] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
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
      handleError(error, t("appliances.errorFetching"));
    } else if (data) {
      setAppliances(data as Appliance[]);
    }
    setLoading(false);
  }

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    void fetchAppliances();

    const action = searchParams.get("action");
    if (action === "add") {
      setOpenAddAppliance(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      setSearchParams(newParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams]);

  const filteredAppliances = appliances.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  const handleCreateAppliance = async (newAppliance: Partial<Appliance>) => {
    try {
      setActionLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        handleError(
          new Error("User not logged in"),
          t("appliances.userNotLoggedIn")
        );
        return;
      }

      const { error } = await supabase.from("appliances").insert([
        {
          ...newAppliance,
          user_id: user.id,
        } as import("../types/database.types").Database["public"]["Tables"]["appliances"]["Insert"],
      ]);

      if (error) {
        handleError(error, t("appliances.errorCreating"));
      } else {
        setOpenAddAppliance(false);
        void fetchAppliances();
      }
    } catch (err: unknown) {
      handleError(err, t("appliances.errorCreating"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAppliance = async (updatedData: Partial<Appliance>) => {
    if (!selectedAppliance?.id) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from("appliances")
        .update(updatedData)
        .eq("id", selectedAppliance.id);

      if (error) {
        handleError(error, t("appliances.errorUpdating"));
      } else {
        setOpenEditAppliance(false);
        setOpenDrawer(false);
        void fetchAppliances();
      }
    } catch (err: unknown) {
      handleError(err, t("appliances.errorUpdating"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRepair = async (newRepair: Partial<Repair>) => {
    if (!selectedAppliance) {
      handleError(
        new Error("No appliance selected"),
        t("appliances.noApplianceSelected")
      );
      return;
    }

    try {
      setActionLoading(true);

      const { error } = await supabase.from("repairs").insert([
        {
          ...newRepair,
          appliance_id: selectedAppliance.id,
        } as import("../types/database.types").Database["public"]["Tables"]["repairs"]["Insert"],
      ]);

      if (error) {
        handleError(error, t("appliances.errorCreatingRepair"));
      } else {
        setOpenAddRepair(false);
        void fetchRepairs(selectedAppliance.id);
      }
    } catch (err: unknown) {
      handleError(err, t("appliances.errorCreatingRepair"));
    } finally {
      setActionLoading(false);
    }
  };

  const fetchRepairs = async (applianceId: string) => {
    const { data, error } = await supabase
      .from("repairs")
      .select("*")
      .eq("appliance_id", applianceId)
      .order("repair_date", { ascending: false });

    if (error) {
      handleError(error, t("appliances.errorFetchingRepairs"));
    } else if (data) {
      setRepairs(data as Repair[]);
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
        handleError(error, t("appliances.errorDeleting"));
      } else {
        setOpenDrawer(false);
        void fetchAppliances();
      }
    } catch (err: unknown) {
      handleError(err, t("appliances.errorDeleting"));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewDetails = (appliance: Appliance) => {
    setSelectedAppliance(appliance);
    void fetchRepairs(appliance.id);
    setOpenDrawer(true);
  };

  const handleScanSuccess = (decodedText: string) => {
    setScanOpen(false);
    const appliance = appliances.find((a) => a.sku === decodedText);

    if (appliance) {
      handleViewDetails(appliance);
    } else {
      setOpenAddAppliance(true);
    }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredAppliances.map((a) => a.id)));
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
                  onChange={(e) => toggleAll(e.target.checked)}
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
                  onToggle={toggleItem}
                  onViewRepairs={handleViewDetails}
                  onAddRepair={(app) => {
                    setSelectedAppliance(app);
                    setOpenAddRepair(true);
                  }}
                  onDelete={(id) => handleDeleteClick(id)}
                />
              </Grid>
            ))}
          </Grid>

          {filteredAppliances.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="text.secondary">
                {t("appliances.noAppliancesFound")}
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t("appliances.delete")}
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

      <ApplianceDialog
        open={openEditAppliance}
        onClose={() => setOpenEditAppliance(false)}
        initialData={selectedAppliance || {}}
        onSave={(updated) => void handleUpdateAppliance(updated)}
        loading={actionLoading}
      />

      <ApplianceRepairDialog
        open={openAddRepair}
        onClose={() => setOpenAddRepair(false)}
        onSave={(newRepair) => void handleCreateRepair(newRepair)}
        appliance={selectedAppliance}
        loading={actionLoading}
      />

      <ApplianceDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        appliance={selectedAppliance}
        repairs={repairs}
        onEdit={(app) => {
          setSelectedAppliance(app);
          setOpenEditAppliance(true);
        }}
        onDelete={(id) => handleDeleteClick(id)}
        onAddRepair={(app) => {
          setSelectedAppliance(app);
          setOpenAddRepair(true);
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
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={(msg) => handleError(new Error(msg), t("inventory.scanError"))}
      />
    </Box>
  );
};

export default Appliances;
