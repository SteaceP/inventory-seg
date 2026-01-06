import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { supabase } from "../supabaseClient";
import BarcodePrinter from "../components/BarcodePrinter";
import type { InventoryItem } from "../types/inventory";

// Sub-components
import InventoryHeader from "../components/inventory/InventoryHeader";
import InventorySearch from "../components/inventory/InventorySearch";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryGrid from "../components/inventory/InventoryGrid";
import InventoryDialog from "../components/inventory/InventoryDialog";
import InventoryScanner from "../components/inventory/InventoryScanner";

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
    image_url: "",
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
  }, [fetchInventory]);

  const handleOpen = React.useCallback((item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: "", category: "", sku: "", stock: 0, price: 0, image_url: "" });
    }
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const getBarcodeFormat = (sku: string) => {
    const cleanSku = sku.trim();
    if (/^\d{12}$/.test(cleanSku)) return "UPC";
    if (/^\d{13}$/.test(cleanSku)) return "EAN13";
    if (/^\d{8}$/.test(cleanSku)) return "EAN8";
    return "CODE128";
  };

  const checkLowStockAndNotify = async (item: Partial<InventoryItem>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (
        userSettings?.email_alerts &&
        (item.stock || 0) <= userSettings.low_stock_threshold
      ) {
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
      console.error("Low stock alert error:", err);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("inventory-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("inventory-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err) {
      setError("Error uploading image. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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

  const handleScanSuccess = (decodedText: string) => {
    setScanOpen(false);
    const item = items.find((i) => i.sku === decodedText);
    if (item) {
      handleOpen(item);
    } else {
      setEditingItem(null);
      setFormData({ name: "", category: "", sku: decodedText, stock: 0, price: 0, image_url: "" });
      setOpen(true);
    }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map((i) => i.id)));
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

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.sku && item.sku.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  });

  if (loading && items.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      <InventoryHeader
        isMobile={isMobile}
        selectedCount={selectedItems.size}
        onPrint={() => window.print()}
        onScan={() => setScanOpen(true)}
        onAdd={() => handleOpen()}
      />

      <InventorySearch
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {!isTablet ? (
        <InventoryTable
          items={filteredItems}
          selectedItems={selectedItems}
          onToggleAll={toggleAll}
          onToggleItem={toggleItem}
          onEdit={handleOpen}
          onDelete={handleDelete}
        />
      ) : (
        <InventoryGrid
          items={filteredItems}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          onEdit={handleOpen}
          onDelete={handleDelete}
        />
      )}

      <InventoryDialog
        open={open}
        editingItem={editingItem}
        formData={formData}
        isMobile={isMobile}
        onClose={handleClose}
        onSave={handleSave}
        onFormDataChange={setFormData}
        onGenerateSKU={generateSKU}
        onImageUpload={handleImageUpload}
        getBarcodeFormat={getBarcodeFormat}
      />

      <InventoryScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={setError}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <BarcodePrinter
        items={items.filter((i) => selectedItems.has(i.id))}
      />
    </Box>
  );
};

export default Inventory;
