import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  CardMedia,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Build as BuildIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Print as PrintIcon,
  PhotoCamera,
  Autorenew as AutoRenewIcon,
  FilterCenterFocus as ScanIcon,
} from "@mui/icons-material";
import Barcode from "react-barcode";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/useThemeContext";
import { useTranslation } from "../i18n";
import InventoryScanner from "../components/inventory/InventoryScanner";
import { useAlert } from "../contexts/useAlertContext";

interface Appliance {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  warranty_expiry: string;
  notes: string;
  photo_url?: string;
  sku?: string;
}

interface Repair {
  id: string;
  repair_date: string;
  description: string;
  cost: number;
  service_provider: string;
}

const Appliances: React.FC = () => {
  const { compactView } = useThemeContext();
  const { t } = useTranslation();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(
    null
  );
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loadingRepairs, setLoadingRepairs] = useState(false);
  const { showError } = useAlert(); // Initialize useAlert

  // Modal states
  const [openAddAppliance, setOpenAddAppliance] = useState(false);
  const [openAddRepair, setOpenAddRepair] = useState(false);
  const [openRepairsList, setOpenRepairsList] = useState(false); // To view history
  const [printAppliance, setPrintAppliance] = useState<Appliance | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);

  // Form states
  const [newAppliance, setNewAppliance] = useState<Partial<Appliance>>({});
  const [newRepair, setNewRepair] = useState<Partial<Repair>>({});

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
    // Defer the initial load to avoid synchronous setState inside effect
    const t = setTimeout(() => {
      fetchAppliances();
    }, 0);
    return () => clearTimeout(t);
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

  const handleCreateAppliance = async () => {
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
      setNewAppliance({});
      fetchAppliances();
    }
  };

  const handleCreateRepair = async () => {
    if (!selectedAppliance) {
      showError(t("appliances.noApplianceSelected"));
      return;
    }

    const { error } = await supabase
      .from("repairs")
      .insert([{ ...newRepair, appliance_id: selectedAppliance.id }]);

    if (error) {
      showError(t("appliances.errorCreatingRepair") + ": " + error.message);
    } else {
      setOpenAddRepair(false);
      setNewRepair({});
      fetchRepairs(selectedAppliance.id); // Refresh repairs list
    }
  };

  const handleDeleteAppliance = async (id: string) => {
    if (confirm(t("appliances.deleteConfirm"))) {
      const { error } = await supabase.from("appliances").delete().eq("id", id);
      if (error) {
        showError(t("appliances.errorDeleting") + ": " + error.message);
      } else {
        fetchAppliances();
      }
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from("appliance-images")
      .upload(filePath, file);

    if (uploadError) {
      showError(
        t("appliances.errorUploadingImage") + ": " + uploadError.message
      );
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("appliance-images").getPublicUrl(filePath);

    setNewAppliance({ ...newAppliance, photo_url: publicUrl });
    setUploading(false);
  };

  const generateSKU = () => {
    const sku = `APP-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
    setNewAppliance({ ...newAppliance, sku });
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (printContent) {
      const windowUrl = "about:blank";
      const uniqueName = new Date().getTime();
      const windowName = "Print" + uniqueName;
      const printWindow = window.open(
        windowUrl,
        windowName,
        "left=50000,top=50000,width=0,height=0"
      );

      if (printWindow) {
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Print Label</title>
                        <style>
                            body { font-family: sans-serif; text-align: center; }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `;

        // Write content using the modern approach
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Set up print trigger
        printWindow.onload = function () {
          printWindow.print();
          printWindow.close();
        };

        printWindow.focus();
      } else {
        showError(t("appliances.errorOpeningPrintWindow"));
      }
    }
  };

  const handleViewRepairs = (appliance: Appliance) => {
    setSelectedAppliance(appliance);
    fetchRepairs(appliance.id);
    setOpenRepairsList(true);
  };

  const handleScanSuccess = (decodedText: string) => {
    setScanOpen(false);
    const appliance = appliances.find((a) => a.sku === decodedText);

    if (appliance) {
      handleViewRepairs(appliance);
    } else {
      // Pre-fill SKU for new appliance
      setNewAppliance({ sku: decodedText });
      setOpenAddAppliance(true);
    }
  };

  return (
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
      <Typography variant="h4" fontWeight="bold" sx={{ color: "text.primary" }}>
        {t("menu.appliances")}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<ScanIcon />}
          onClick={() => setScanOpen(true)}
          sx={{
            color: "text.primary",
            borderColor: "divider",
            fontWeight: "bold",
            flex: { xs: 1, sm: "0 1 auto" },
          }}
        >
          {t("inventory.scan")}
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddAppliance(true)}
          sx={{
            background: "linear-gradient(45deg, #027d6f 30%, #1a748b 90%)",
            color: "white",
            fontWeight: "bold",
            boxShadow: "0 3px 5px 2px rgba(2, 125, 111, .3)",
            flex: { xs: 1, sm: "0 1 auto" },
          }}
        >
          {t("appliances.add")}
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {appliances.map((appliance) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={appliance.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                {appliance.photo_url && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={appliance.photo_url}
                    alt={appliance.name}
                    sx={{ objectFit: "cover", display: "block", width: "100%" }}
                  />
                )}
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {appliance.name}
                    </Typography>
                    <Chip
                      label={appliance.brand}
                      size="small"
                      sx={{
                        bgcolor: "rgba(2, 125, 111, 0.1)",
                        color: "primary.main",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {appliance.type} {appliance.model && `- ${appliance.model}`}
                  </Typography>
                  {appliance.sku && (
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight="bold"
                    >
                      SKU: {appliance.sku}
                    </Typography>
                  )}
                  {appliance.notes && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, fontStyle: "italic" }}
                    >
                      "{appliance.notes}"
                    </Typography>
                  )}
                </CardContent>
                <CardActions
                  sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                    px: 2,
                    pb: 2,
                    gap: 1,
                  }}
                >
                  <Button
                    size="small"
                    startIcon={<HistoryIcon />}
                    onClick={() => handleViewRepairs(appliance)}
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
                      onClick={() => setPrintAppliance(appliance)}
                      title={t("appliances.printLabel")}
                    >
                      <PrintIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedAppliance(appliance);
                        setOpenAddRepair(true);
                      }}
                      title={t("appliances.addRepair")}
                    >
                      <BuildIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteAppliance(appliance.id)}
                      title={t("appliances.delete")}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Appliance Dialog */}
      <Dialog
        open={openAddAppliance}
        onClose={() => setOpenAddAppliance(false)}
        fullWidth
        maxWidth="sm"
        sx={{ px: { xs: 2, sm: 3 } }}
      >
        <DialogTitle>{t("appliances.add")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("appliances.nameLabel")}
            fullWidth
            value={newAppliance.name || ""}
            onChange={(e) =>
              setNewAppliance({ ...newAppliance, name: e.target.value })
            }
          />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", my: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              disabled={uploading}
            >
              {uploading ? t("appliances.uploading") : t("appliances.addPhoto")}
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImageUpload}
              />
            </Button>
            {newAppliance.photo_url && (
              <Typography variant="caption" color="success.main">
                {t("appliances.photoAdded")}
              </Typography>
            )}
          </Box>

          <TextField
            margin="dense"
            label={t("appliances.skuLabel")}
            fullWidth
            value={newAppliance.sku || ""}
            onChange={(e) =>
              setNewAppliance({ ...newAppliance, sku: e.target.value })
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={generateSKU}
                    edge="end"
                    title={t("appliances.generateSku")}
                  >
                    <AutoRenewIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="dense"
            label={t("appliances.type")}
            fullWidth
            value={newAppliance.type || ""}
            onChange={(e) =>
              setNewAppliance({ ...newAppliance, type: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label={t("appliances.brand")}
            fullWidth
            value={newAppliance.brand || ""}
            onChange={(e) =>
              setNewAppliance({ ...newAppliance, brand: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label={t("appliances.model")}
            fullWidth
            value={newAppliance.model || ""}
            onChange={(e) =>
              setNewAppliance({ ...newAppliance, model: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label={t("appliances.purchaseDate")}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newAppliance.purchase_date || ""}
            onChange={(e) =>
              setNewAppliance({
                ...newAppliance,
                purchase_date: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label={t("appliances.notes")}
            fullWidth
            multiline
            rows={2}
            value={newAppliance.notes || ""}
            onChange={(e) =>
              setNewAppliance({ ...newAppliance, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddAppliance(false)}>
            {t("appliances.cancel")}
          </Button>
          <Button onClick={handleCreateAppliance} variant="contained">
            {t("appliances.add")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Repair Dialog */}
      <Dialog
        open={openAddRepair}
        onClose={() => setOpenAddRepair(false)}
        fullWidth
        maxWidth="sm"
        sx={{ px: { xs: 2, sm: 3 } }}
      >
        <DialogTitle>{`${t("appliances.addRepair")} ${
          selectedAppliance?.name || ""
        }`}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("appliances.repairDescription")}
            fullWidth
            multiline
            rows={2}
            value={newRepair.description || ""}
            onChange={(e) =>
              setNewRepair({ ...newRepair, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label={t("appliances.date")}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={
              newRepair.repair_date || new Date().toISOString().split("T")[0]
            }
            onChange={(e) =>
              setNewRepair({ ...newRepair, repair_date: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label={t("appliances.cost")}
            type="number"
            fullWidth
            value={newRepair.cost || ""}
            onChange={(e) =>
              setNewRepair({ ...newRepair, cost: parseFloat(e.target.value) })
            }
          />
          <TextField
            margin="dense"
            label={t("appliances.serviceProvider")}
            fullWidth
            value={newRepair.service_provider || ""}
            onChange={(e) =>
              setNewRepair({ ...newRepair, service_provider: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddRepair(false)}>
            {t("appliances.cancel")}
          </Button>
          <Button onClick={handleCreateRepair} variant="contained">
            {t("appliances.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View History Dialog */}
      <Dialog
        open={openRepairsList}
        onClose={() => setOpenRepairsList(false)}
        fullWidth
        maxWidth="sm"
        sx={{ px: { xs: 2, sm: 3 } }}
      >
        <DialogTitle>{`${t("appliances.history")}: ${
          selectedAppliance?.name
        }`}</DialogTitle>
        <DialogContent dividers>
          {loadingRepairs ? (
            <CircularProgress />
          ) : repairs.length === 0 ? (
            <Typography color="text.secondary">
              {t("appliances.noRepairs")}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {repairs.map((repair) => (
                <Paper
                  key={repair.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography fontWeight="bold">
                      {repair.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {repair.repair_date}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {t("appliances.cost")}:{" "}
                    {repair.cost ? `${repair.cost} $` : t("appliances.unknown")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("appliances.serviceProvider")}:{" "}
                    {repair.service_provider || t("appliances.unknown")}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRepairsList(false)}>
            {t("appliances.close")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Barcode Dialog */}
      <Dialog
        open={!!printAppliance}
        onClose={() => setPrintAppliance(null)}
        fullWidth
        maxWidth="sm"
        sx={{ px: { xs: 2, sm: 3 } }}
      >
        <DialogTitle>{`${t("appliances.printLabel")} ${
          printAppliance?.name
        }`}</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
          }}
        >
          <div id="printable-area" style={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold">
              {printAppliance?.name}
            </Typography>
            <Typography variant="body2">
              {printAppliance?.brand} {printAppliance?.model}
            </Typography>
            <Box sx={{ my: 2 }}>
              {printAppliance?.sku ? (
                <Barcode
                  value={printAppliance.sku}
                  width={2}
                  height={50}
                  fontSize={14}
                />
              ) : (
                <Typography color="error">{t("appliances.noSku")}</Typography>
              )}
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintAppliance(null)}>
            {t("appliances.close")}
          </Button>
          <Button
            onClick={handlePrint}
            variant="contained"
            startIcon={<PrintIcon />}
          >
            {t("appliances.print")}
          </Button>
        </DialogActions>
      </Dialog>

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
