import React, { useState, useEffect, useMemo } from "react";
import { useUserContext } from "@contexts/UserContext";
import { useTranslation } from "@/i18n";
import { useInventoryContext } from "@contexts/InventoryContext";
import QuickActions from "@components/dashboard/QuickActions/QuickActions";
import StockHealth from "@components/dashboard/StockHealth/StockHealth";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { supabase } from "@/supabaseClient";
import InventoryScanner from "@components/inventory/InventoryScanner/InventoryScanner";
import ApplianceDialog from "@components/appliances/ApplianceDialog/ApplianceDialog";
import InventoryDialog from "@components/inventory/InventoryDialog/InventoryDialog";
import { useNavigate } from "react-router-dom";
import type { Appliance } from "@/types/appliances";
import { useInventoryForm } from "@hooks/inventory/useInventoryForm";
import { useInventoryActions } from "@hooks/inventory/useInventoryActions";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import CategoryIcon from "@mui/icons-material/Category";
import HistoryIcon from "@mui/icons-material/History";
import SuccessIcon from "@mui/icons-material/CheckCircle";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const { compactView } = useUserContext();
  const theme = useTheme();

  // Helper to resolve nested palette colors (e.g., "status.success")
  const resolveColor = (path: string) => {
    const parts = path.split(".");
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    let current: any = theme.palette;
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
      } else {
        return path; // Fallback to path itself (e.g. if it's a hex)
      }
    }
    return typeof current === "string" ? current : path;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
  };

  const resolvedColor = resolveColor(color);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(resolvedColor, 0.2),
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(resolvedColor, 0.05)
            : alpha(resolvedColor, 0.02),
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px -10px ${alpha(resolvedColor, 0.3)}`,
          borderColor: alpha(resolvedColor, 0.4),
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 30,
          right: 25,
          opacity: 0.05,
          transform: "scale(2.5)",
          color: resolvedColor,
          pointerEvents: "none",
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1, sm: 1.5 },
          mb: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 0.5, sm: 0.75 },
            borderRadius: "8px",
            bgcolor: alpha(resolvedColor, 0.1),
            color: resolvedColor,
            minWidth: "fit-content",
            "& svg": { fontSize: { xs: 16, sm: 20 } },
            "& img": { width: { xs: 16, sm: 20 }, height: { xs: 16, sm: 20 } },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="700"
          noWrap
          sx={{
            textTransform: "uppercase",
            letterSpacing: { xs: 0.5, sm: 1 },
            fontSize: { xs: "0.625rem", sm: "0.7rem" },
          }}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant={compactView ? "h6" : "h4"}
        fontWeight="900"
        sx={{
          color: resolvedColor,
          letterSpacing: "-0.02em",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: { xs: "1rem", sm: "1.35rem", md: "1.85rem" },
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const { handleError } = useErrorHandler();
  const { role, lowStockThreshold } = useUserContext();
  const [dailyStats, setDailyStats] = useState({ in: 0, out: 0 });
  const { t } = useTranslation();
  const { items, categories: contextCategories } = useInventoryContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [scanOpen, setScanOpen] = useState(false);
  const [addApplianceOpen, setAddApplianceOpen] = useState(false);
  const [isSavingAppliance, setIsSavingAppliance] = useState(false);

  // Success/Not Found Dialogs
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successType, setSuccessType] = useState<"item" | "appliance" | null>(
    null
  );
  const [itemNotFoundOpen, setItemNotFoundOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  // Inventory logic
  const {
    open: inventoryOpen,
    setOpen: setInventoryOpen,
    formData: inventoryFormData,
    setFormData: setInventoryFormData,
    handleOpen: handleOpenInventory,
    handleClose: handleCloseInventory,
    generateSKU,
  } = useInventoryForm();

  const {
    handleSave,
    actionLoading: inventorySaving,
    handleImageUpload,
  } = useInventoryActions({
    formData: inventoryFormData,
    setFormData: setInventoryFormData,
    editingItem: null,
    setOpen: setInventoryOpen,
    setEditingId: () => {},
  });

  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStockItems = items
      .filter((item) => {
        const categoryThreshold = contextCategories.find(
          (c) => c.name === item.category
        )?.low_stock_threshold;
        const effectiveThreshold =
          item.low_stock_threshold ?? categoryThreshold ?? lowStockThreshold;
        return (item.stock || 0) <= (effectiveThreshold || 0);
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        stock: item.stock || 0,
      }));

    const categoryCounts: Record<string, number> = {};
    items.forEach((item) => {
      if (item.category) {
        categoryCounts[item.category] =
          (categoryCounts[item.category] || 0) + 1;
      }
    });

    const topCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A";
    return { totalItems, lowStockItems, topCategory };
  }, [items, lowStockThreshold, contextCategories]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch("/api/activity/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard stats");
        const data = (await response.json()) as { in: number; out: number };
        setDailyStats(data);
      } catch (err) {
        handleError(err, t("errors.loadDashboard"));
      }
    };
    void fetchDashboardData();
  }, [t, handleError]);

  const handleSaveAppliance = async (newAppliance: Partial<Appliance>) => {
    try {
      setIsSavingAppliance(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        handleError(new Error("User not logged in"), t("errors.noUser"));
        return;
      }

      if (!newAppliance.name) {
        handleError(new Error("Name is required"), t("errors.nameRequired"));
        return;
      }

      const { error } = await supabase.from("appliances").insert([
        {
          ...newAppliance,
          name: newAppliance.name,
          user_id: user.id,
        } as import("@/types/database.types").Database["public"]["Tables"]["appliances"]["Insert"],
      ]);

      if (error) {
        handleError(error, t("errors.createAppliance"));
      } else {
        setAddApplianceOpen(false);
        setSuccessType("appliance");
        setSuccessDialogOpen(true);
      }
    } catch (err: unknown) {
      handleError(err, t("errors.createAppliance"));
    } finally {
      setIsSavingAppliance(false);
    }
  };

  const getBarcodeFormat = (sku: string) => {
    const cleanSku = sku.trim();
    if (/^\d{12}$/.test(cleanSku)) return "UPC" as const;
    if (/^\d{13}$/.test(cleanSku)) return "EAN13" as const;
    if (/^\d{8}$/.test(cleanSku)) return "EAN8" as const;
    return "CODE128" as const;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "1600px", mx: "auto" }}>
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" fontWeight="900" gutterBottom>
          {t("dashboard.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("dashboard.welcome")}
        </Typography>
      </Box>

      {/* QuickActions - Show at top on mobile for better accessibility */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <QuickActions
            onScanClick={() => setScanOpen(true)}
            onAddApplianceClick={() => setAddApplianceOpen(true)}
            onAddInventoryClick={() => handleOpenInventory()}
          />
        </Box>
      )}

      <Grid
        container
        spacing={{ xs: 1.5, sm: 3 }}
        sx={{ mt: { xs: 0, sm: 2 } }}
      >
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t("dashboard.totalItems")}
            value={stats.totalItems.toLocaleString()}
            icon={<InventoryIcon />}
            color="status.success"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t("dashboard.lowStockItems")}
            value={stats.lowStockItems.length}
            icon={<WarningIcon />}
            color="status.warning"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t("dashboard.topCategory")}
            value={stats.topCategory}
            icon={<CategoryIcon />}
            color="status.info"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t("dashboard.movements")}
            value={`+${dailyStats.in} / -${dailyStats.out}`}
            icon={<HistoryIcon />}
            color="brand.secondary"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <StockHealth />
      </Box>

      {/* QuickActions - Show at bottom on desktop/tablet */}
      {!isMobile && (
        <Box sx={{ mt: 4 }}>
          <QuickActions
            onScanClick={() => setScanOpen(true)}
            onAddApplianceClick={() => setAddApplianceOpen(true)}
            onAddInventoryClick={() => handleOpenInventory()}
          />
        </Box>
      )}

      <InventoryScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={(decodedText) => {
          setScanOpen(false);
          const existingItem = items.find((i) => i.sku === decodedText);
          if (existingItem) {
            void navigate(
              `/inventory?scanResult=${encodeURIComponent(decodedText)}`
            );
          } else {
            setScannedBarcode(decodedText);
            setItemNotFoundOpen(true);
          }
        }}
        onError={(msg) => handleError(new Error(msg), msg)}
      />

      <ApplianceDialog
        open={addApplianceOpen}
        onClose={() => setAddApplianceOpen(false)}
        onSave={(newApp) => void handleSaveAppliance(newApp)}
        loading={isSavingAppliance}
      />

      <InventoryDialog
        open={inventoryOpen}
        editingItem={null}
        formData={inventoryFormData}
        isMobile={isMobile}
        onClose={handleCloseInventory}
        onSave={() => {
          void handleSave().then(() => {
            setTimeout(() => {
              setSuccessType("item");
              setSuccessDialogOpen(true);
            }, 500);
          });
        }}
        onFormDataChange={setInventoryFormData}
        onGenerateSKU={generateSKU}
        onImageUpload={(e) => void handleImageUpload(e)}
        getBarcodeFormat={getBarcodeFormat}
        role={role}
        loading={inventorySaving}
      />

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SuccessIcon color="success" />
          {t("common.success")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {successType === "item"
              ? t("inventory.scanner.success.item")
              : t("inventory.scanner.success.appliance")}{" "}
            {t("inventory.scanner.success.nextAction")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)}>
            {t("common.done")}
          </Button>
          <Button
            onClick={() => {
              setSuccessDialogOpen(false);
              if (successType === "item") {
                handleOpenInventory();
              } else {
                setAddApplianceOpen(true);
              }
            }}
          >
            {successType === "item"
              ? "Add Another Item"
              : "Add Another Appliance"}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setSuccessDialogOpen(false);
              void navigate(
                successType === "item" ? "/inventory" : "/appliances"
              );
            }}
          >
            {t("common.viewList")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Not Found Dialog */}
      <Dialog
        open={itemNotFoundOpen}
        onClose={() => setItemNotFoundOpen(false)}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          {t("inventory.scanner.notFound.title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("inventory.scanner.notFound.message", {
              sku: scannedBarcode || "",
            })}
          </DialogContentText>
          <DialogContentText sx={{ mt: 1.5, fontSize: "0.875rem" }}>
            {t("inventory.scanner.notFound.rescanHint")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemNotFoundOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setItemNotFoundOpen(false);
              handleOpenInventory();
              setInventoryFormData((prev) => ({
                ...prev,
                sku: scannedBarcode || "",
              }));
            }}
          >
            {t("inventory.scanner.notFound.addButton")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
