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
import { supabase } from "../supabaseClient";
import Barcode from "react-barcode";
import { Html5QrcodeScanner } from "html5-qrcode";

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

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const fetchInventory = async () => {
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
  };

  useEffect(() => {
    fetchInventory();
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

  const handleScanSuccess = React.useCallback(
    (decodedText: string) => {
      setScanOpen(false);
      // Find item by SKU
      // Note: items is a dependency here, so it might re-create this function
      // but we can also search in the latest state if needed.
      setItems((prevItems) => {
        const item = prevItems.find((i) => i.sku === decodedText);
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
        return prevItems;
      });
    },
    [handleOpen]
  );

  const handleScanSuccessRef = useRef(handleScanSuccess);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    handleScanSuccessRef.current = handleScanSuccess;
  }, [handleScanSuccess]);

  // Handle scanner lifecycle
  useEffect(() => {
    if (scanOpen && !scannerRef.current) {
      // Wait for the dialog to render before initializing the scanner
      const timeoutId = setTimeout(() => {
        console.log("Initializing scanner...");
        const scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            console.log("Barcode scanned:", decodedText);
            // Clean up scanner before handling success
            if (scannerRef.current) {
              scannerRef.current.clear().catch((error) => {
                console.error("Failed to clear scanner", error);
              });
              scannerRef.current = null;
            }
            // Call the latest version of handleScanSuccess
            handleScanSuccessRef.current(decodedText);
          },
          (errorMessage) => {
            // ignore scan errors (they happen frequently as camera tries to scan)
            // console.log("Scan error:", errorMessage);
          }
        );

        scannerRef.current = scanner;
        console.log("Scanner initialized successfully");
      }, 100); // Small delay to let the dialog render

      return () => clearTimeout(timeoutId);
    }

    // Cleanup when dialog closes
    if (!scanOpen && scannerRef.current) {
      console.log("Cleaning up scanner...");
      scannerRef.current.clear().catch((error) => {
        console.error("Failed to clear scanner", error);
      });
      scannerRef.current = null;
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
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Inventory
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ScanIcon />}
            onClick={() => setScanOpen(true)}
            sx={{ border: "1px solid #30363d", color: "text.primary" }}
          >
            Scan
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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
        PaperProps={{
          sx: {
            bgcolor: "#0d1117",
            color: "white",
            border: "1px solid #30363d",
            borderRadius: "12px",
            minWidth: "450px",
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
            <Box sx={{ display: "flex", gap: 2 }}>
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

      {/* Scanner Dialog */}
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
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle>Scan Barcode</DialogTitle>
        <DialogContent>
          <Box id="reader" sx={{ width: "100%", minHeight: "300px" }} />
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            Point your camera at a barcode to identify or add an item.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setScanOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
