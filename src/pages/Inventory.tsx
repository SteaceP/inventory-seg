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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCodeScanner as ScanIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import { supabase } from "../supabaseClient";
import Barcode from "react-barcode";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";

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
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    sku: "",
    stock: 0,
    price: 0,
  });

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
      console.error("Failed to fetch inventory:", error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

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
          console.log("Initializing custom scanner...");
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const config = {
            fps: 20,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              console.log("Barcode scanned:", decodedText);

              // Stop scanner properly before handling success
              html5QrCode
                .stop()
                .then(() => {
                  scannerRef.current = null;
                  handleScanSuccessRef.current(decodedText);
                })
                .catch((err) => {
                  console.error("Failed to stop scanner", err);
                  scannerRef.current = null;
                  handleScanSuccessRef.current(decodedText);
                });
            },
            () => {} // silent errors
          );

          console.log("Scanner started successfully");
        } catch (err) {
          console.error("Unable to start scanner", err);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }

    if (!scanOpen && scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    }
  }, [scanOpen]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (editingItem) {
      const { error } = await supabase
        .from("inventory")
        .update(formData)
        .eq("id", editingItem.id);

      if (error) console.error("Error updating item:", error);
    } else {
      const { error } = await supabase.from("inventory").insert([formData]);

      if (error) console.error("Error adding item:", error);
    }

    handleClose();
    fetchInventory();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from("inventory").delete().eq("id", id);

      if (error) console.error("Error deleting item:", error);
      fetchInventory();
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
              <TableRow key={item.id}>
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
                  width={1.5}
                  height={50}
                  fontSize={14}
                  background="transparent"
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
    </Box>
  );
};

export default Inventory;
