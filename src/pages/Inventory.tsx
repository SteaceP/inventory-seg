import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCodeScanner as ScanIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import { supabase } from "../supabaseClient";
import Barcode from "react-barcode";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import BarcodePrinter from "../components/BarcodePrinter";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  price: number;
}

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    sku: "",
    stock: 0,
    price: 0,
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const fetchInventory = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("name");

    if (error) {
      setError("Failed to load inventory. Please try again.");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpen = React.useCallback((item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: "", category: "", sku: "", stock: 0, price: 0 });
    }
    setOpen(true);
  }, []);

  const getBarcodeFormat = (sku: string) => {
    const cleanSku = sku.trim();
    if (/^\d{12}$/.test(cleanSku)) return "UPC";
    if (/^\d{13}$/.test(cleanSku)) return "EAN13";
    if (/^\d{8}$/.test(cleanSku)) return "EAN8";
    return "CODE128";
  };

  const handleScanSuccess = React.useCallback(
    (decodedText: string) => {
      setScanOpen(false);
      // Find item by SKU in the current items state
      const item = items.find((i) => i.sku === decodedText);
      if (item) {
        handleOpen(item);
      } else {
        // If not found, open as new item with this SKU
        setEditingItem(null);
        setFormData({
          name: "",
          category: "",
          sku: decodedText,
          stock: 0,
          price: 0,
        });
        setOpen(true);
      }
    },
    [handleOpen, items]
  );

  const handleScanSuccessRef = useRef(handleScanSuccess);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    handleScanSuccessRef.current = handleScanSuccess;
  }, [handleScanSuccess]);

  // Handle scanner lifecycle
  useEffect(() => {
    if (scanOpen && !scannerRef.current) {
      const timeoutId = setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const config = {
            fps: 20,
            qrbox: { width: 300, height: 150 }, // Wide rectangle for 1D barcodes
            aspectRatio: 1.0,
          };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // Stop scanner properly before handling success
              html5QrCode
                .stop()
                .then(() => {
                  scannerRef.current = null;
                  handleScanSuccessRef.current(decodedText);
                })
                .catch(() => {
                  scannerRef.current = null;
                  handleScanSuccessRef.current(decodedText);
                });
            },
            () => {} // silent errors
          );
        } catch {
          setError("Unable to start camera. Please check permissions.");
          setScanOpen(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }

    if (!scanOpen && scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    }
  }, [scanOpen]);

  const handleClose = () => {
    setOpen(false);
  };

  const checkLowStockAndNotify = async (item: Partial<InventoryItem>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // GET user settings
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (
        userSettings?.email_alerts &&
        (item.stock || 0) <= userSettings.low_stock_threshold
      ) {
        // Trigger email notification via Cloudflare Function
        await fetch("/api/send-low-stock-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: item.name,
            currentStock: item.stock,
            threshold: userSettings.low_stock_threshold,
            userEmail: user.email,
          }),
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send email alert";
      setError(`Low stock alert error: ${message}`);
    }
  };

  const handleSave = async () => {
    // Basic Validation & Sanitization
    const sanitizedData = {
      ...formData,
      name: formData.name?.trim(),
      category: formData.category?.trim(),
      sku: formData.sku?.trim(),
      stock: Math.max(0, formData.stock || 0),
      price: Math.max(0, formData.price || 0),
    };

    if (!sanitizedData.name) {
      alert("Item name is required.");
      return;
    }

    if (editingItem) {
      const { error } = await supabase
        .from("inventory")
        .update(sanitizedData)
        .eq("id", editingItem.id);

      if (error) {
        setError("Failed to update item. Please try again.");
        return;
      }
    } else {
      const { error } = await supabase
        .from("inventory")
        .insert([sanitizedData]);

      if (error) {
        setError("Failed to add item. Please try again.");
        return;
      }
    }

    // Check for low stock and notify if necessary
    checkLowStockAndNotify(sanitizedData);

    handleClose();
    fetchInventory();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from("inventory").delete().eq("id", id);

      if (error) {
        setError("Failed to delete item. Please try again.");
      } else {
        fetchInventory();
      }
    }
  };

  const generateSKU = () => {
    const random = Math.floor(10000000 + Math.random() * 90000000);
    setFormData({ ...formData, sku: random.toString() });
  };

  if (loading && items.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 0 : 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Inventory
        </Typography>
        <Box
          sx={{ display: "flex", gap: 2, width: { xs: "100%", sm: "auto" } }}
        >
          {selectedItems.size > 0 && (
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              fullWidth={isMobile}
              onClick={() => window.print()}
              sx={{
                border: "1px solid #30363d",
                color: "text.primary",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(88, 166, 255, 0.1)",
                },
              }}
            >
              Print Labels ({selectedItems.size})
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<ScanIcon />}
            fullWidth={isMobile}
            onClick={() => setScanOpen(true)}
            sx={{ border: "1px solid #30363d", color: "text.primary" }}
          >
            Scan
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth={isMobile}
            onClick={() => handleOpen()}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          background: "rgba(22, 27, 34, 0.7)",
          backdropFilter: "blur(10px)",
          border: "1px solid #30363d",
          borderRadius: "12px",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{ borderBottom: "1px solid #30363d" }}
              >
                <Checkbox
                  indeterminate={
                    selectedItems.size > 0 && selectedItems.size < items.length
                  }
                  checked={
                    items.length > 0 && selectedItems.size === items.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(new Set(items.map((i) => i.id)));
                    } else {
                      setSelectedItems(new Set());
                    }
                  }}
                  sx={{ color: "text.secondary" }}
                />
              </TableCell>
              <TableCell
                sx={{
                  color: "text.secondary",
                  borderBottom: "1px solid #30363d",
                }}
              >
                SKU
              </TableCell>
              <TableCell
                sx={{
                  color: "text.secondary",
                  borderBottom: "1px solid #30363d",
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  color: "text.secondary",
                  borderBottom: "1px solid #30363d",
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{
                  color: "text.secondary",
                  borderBottom: "1px solid #30363d",
                }}
              >
                Stock
              </TableCell>
              <TableCell
                sx={{
                  color: "text.secondary",
                  borderBottom: "1px solid #30363d",
                }}
              >
                Price
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: "text.secondary",
                  borderBottom: "1px solid #30363d",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} selected={selectedItems.has(item.id)}>
                <TableCell
                  padding="checkbox"
                  sx={{ borderBottom: "1px solid #30363d" }}
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedItems);
                      if (e.target.checked) {
                        newSelected.add(item.id);
                      } else {
                        newSelected.delete(item.id);
                      }
                      setSelectedItems(newSelected);
                    }}
                    sx={{ color: "text.secondary" }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #30363d",
                    fontFamily: "monospace",
                  }}
                >
                  {item.sku || "-"}
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #30363d" }}>
                  {item.name}
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #30363d" }}>
                  {item.category}
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #30363d" }}>
                  {item.stock}
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #30363d" }}>
                  ${item.price.toFixed(2)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ borderBottom: "1px solid #30363d" }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(item)}
                    sx={{ color: "primary.main", mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit/Add Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: "#0d1117",
            color: "white",
            border: isMobile ? "none" : "1px solid #30363d",
            borderRadius: isMobile ? 0 : "12px",
            minWidth: isMobile ? "100%" : "450px",
          },
        }}
      >
        <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <TextField
                label="SKU / Barcode"
                fullWidth
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "#30363d" },
                  },
                }}
                InputLabelProps={{ sx: { color: "text.secondary" } }}
              />
              <Tooltip title="Generate SKU">
                <IconButton
                  onClick={generateSKU}
                  sx={{ mt: 1, color: "primary.main" }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {formData.sku && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  p: 2,
                  bgcolor: "white",
                  borderRadius: "8px",
                }}
              >
                <Barcode
                  value={formData.sku}
                  format={getBarcodeFormat(formData.sku)}
                  width={2.0}
                  height={50}
                  fontSize={14}
                  background="#ffffff"
                  margin={10}
                />
              </Box>
            )}

            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#30363d" },
                },
              }}
              InputLabelProps={{ sx: { color: "text.secondary" } }}
            />
            <TextField
              label="Category"
              fullWidth
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#30363d" },
                },
              }}
              InputLabelProps={{ sx: { color: "text.secondary" } }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
              }}
            >
              <TextField
                label="Stock"
                type="number"
                fullWidth
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "#30363d" },
                  },
                }}
                InputLabelProps={{ sx: { color: "text.secondary" } }}
              />
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "#30363d" },
                  },
                }}
                InputLabelProps={{ sx: { color: "text.secondary" } }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        maxWidth="xs"
        fullWidth
        disableEnforceFocus
        disableRestoreFocus
        PaperProps={{
          sx: {
            bgcolor: "#0d1117",
            color: "white",
            border: "1px solid #30363d",
            borderRadius: "20px",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: "center", position: "relative" }}>
          <IconButton
            onClick={() => setScanOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "text.secondary",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            Scan Barcode
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Align the barcode within the frame
          </Typography>

          <Box
            sx={{
              position: "relative",
              width: "300px",
              height: "300px",
              margin: "0 auto",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              border: "2px solid #30363d",
            }}
          >
            <Box id="reader" sx={{ width: "100%", height: "100%" }} />

            {/* Custom Scanner Overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Corner Accents */}
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  width: 30,
                  height: 30,
                  borderLeft: "4px solid #58a6ff",
                  borderTop: "4px solid #58a6ff",
                  borderRadius: "4px 0 0 0",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: 30,
                  height: 30,
                  borderRight: "4px solid #58a6ff",
                  borderTop: "4px solid #58a6ff",
                  borderRadius: "0 4px 0 0",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  width: 30,
                  height: 30,
                  borderLeft: "4px solid #58a6ff",
                  borderBottom: "4px solid #58a6ff",
                  borderRadius: "0 0 0 4px",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  width: 30,
                  height: 30,
                  borderRight: "4px solid #58a6ff",
                  borderBottom: "4px solid #58a6ff",
                  borderRadius: "0 0 4px 0",
                }}
              />

              {/* Pulsing Scan Line */}
              <motion.div
                initial={{ top: "15%" }}
                animate={{ top: "85%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
                style={{
                  position: "absolute",
                  left: "10%",
                  right: "10%",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, #58a6ff, transparent)",
                  boxShadow: "0 0 15px #58a6ff",
                  zIndex: 10,
                }}
              />

              {/* Semi-transparent Backdrop Mask */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: "40px solid rgba(13, 17, 23, 0.4)",
                }}
              />
            </Box>
          </Box>

          <Button
            onClick={() => setScanOpen(false)}
            variant="outlined"
            sx={{
              mt: 4,
              color: "text.secondary",
              borderColor: "#30363d",
              borderRadius: "10px",
              px: 4,
            }}
          >
            Cancel
          </Button>
        </Box>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      </Snackbar>
      <BarcodePrinter
        items={items.filter((item) => selectedItems.has(item.id))}
      />
    </Box>
  );
};

export default Inventory;
