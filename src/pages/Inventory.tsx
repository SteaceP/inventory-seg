import React, { useState } from "react";
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { supabase } from "../supabaseClient";
import { useThemeContext } from "../contexts/useThemeContext";
import { useInventoryContext } from "../contexts/useInventoryContext";
import BarcodePrinter from "../components/BarcodePrinter";
import type { InventoryItem } from "../types/inventory";

// Sub-components
import InventoryHeader from "../components/inventory/InventoryHeader";
import InventorySearch from "../components/inventory/InventorySearch";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryGrid from "../components/inventory/InventoryGrid";
import InventoryDialog from "../components/inventory/InventoryDialog";
import InventoryScanner from "../components/inventory/InventoryScanner";
import StockAdjustmentDialog from "../components/inventory/StockAdjustmentDialog";

const Inventory: React.FC = () => {
  const { items, loading: inventoryLoading, refreshInventory } = useInventoryContext();
  const [actionLoading, setActionLoading] = useState(false); // For local actions like upload/save
  const [open, setOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    sku: "",
    stock: 0,
    image_url: "",
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const { role } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));



  const handleOpen = React.useCallback((item?: InventoryItem) => {
    if (role === 'user' && item) {
      setEditingItem(item);
      setStockDialogOpen(true);
      return;
    }

    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: "", category: "", sku: "", stock: 0, image_url: "" });
    }
    setOpen(true);
  }, [role]);

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

      const isLowStock = (item.stock || 0) <= (userSettings?.low_stock_threshold ?? 5);

      if (isLowStock) {
        // Handle In-App/Browser Notifications
        if (userSettings?.notifications && "Notification" in window && Notification.permission === "granted") {
          const notificationData = {
            body: `L'article "${item.name}" est à ${item.stock} unités.`,
            icon: "/icon.svg",
            badge: "/icon.svg",
            tag: "low-stock-" + item.id,
            vibrate: [200, 100, 200],
            requireInteraction: true,
            data: {
              url: "/inventory"
            }
          } as NotificationOptions & { vibrate?: number[] };

          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification("Alerte Stock Faible", notificationData);
            });
          } else {
            new Notification("Alerte Stock Faible", notificationData);
          }
        }

        // Handle Email Alerts
        if (userSettings?.email_alerts) {
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
      }
    } catch (err) {
      console.error("Low stock alert error:", err);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setActionLoading(true);
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
      setError("Erreur lors du téléchargement de l'image. Veuillez réessayer.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockSave = async (itemId: string, newStock: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("inventory")
        .update({ stock: newStock })
        .eq("id", itemId);

      if (error) throw error;

      // Log the stock update activity
      if (user) {
        const item = items.find(i => i.id === itemId);
        await supabase.from("inventory_activity").insert({
          inventory_id: itemId,
          user_id: user.id,
          action: "updated",
          item_name: item?.name || "Unknown Item",
          changes: { stock: newStock, old_stock: item?.stock },
        });
      }

      const updatedItem = items.find(i => i.id === itemId);
      if (updatedItem) {
        checkLowStockAndNotify({ ...updatedItem, stock: newStock });
      }

      setStockDialogOpen(false);
      refreshInventory();
    } catch (err) {
      console.error("Error updating stock:", err);
      setError("Erreur lors de la mise à jour du stock.");
    }
  };

  const handleSave = async () => {
    const sanitizedData = {
      ...formData,
      name: formData.name?.trim(),
      category: formData.category?.trim(),
      sku: formData.sku?.trim(),
      stock: Math.max(0, formData.stock || 0),
    };

    if (!sanitizedData.name) {
      alert("Le nom de l'article est requis.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editingItem) {
        const { error } = await supabase
          .from("inventory")
          .update(sanitizedData)
          .eq("id", editingItem.id);

        if (error) {
          setError("La mise à jour de l'article a échoué. Veuillez réessayer.");
          return;
        }

        // Log the update activity
        if (user) {
          await supabase.from("inventory_activity").insert({
            inventory_id: editingItem.id,
            user_id: user.id,
            action: "updated",
            item_name: sanitizedData.name,
            changes: { ...sanitizedData, old_stock: editingItem.stock },
          });
        }
      } else {
        const { data: newItem, error } = await supabase
          .from("inventory")
          .insert([sanitizedData])
          .select()
          .single();

        if (error) {
          setError("L'ajout de l'article a échoué. Veuillez réessayer.");
          return;
        }

        // Log the create activity
        if (user && newItem) {
          await supabase.from("inventory_activity").insert({
            inventory_id: newItem.id,
            user_id: user.id,
            action: "created",
            item_name: sanitizedData.name,
            changes: sanitizedData,
          });
        }
      }

      checkLowStockAndNotify(sanitizedData);
      handleClose();
      refreshInventory();
    } catch (err) {
      console.error("Error saving item:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      try {
        // Get item name before deleting
        const item = items.find((i) => i.id === id);
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from("inventory").delete().eq("id", id);
        if (error) {
          setError("La suppression de l'article a échoué. Veuillez réessayer.");
        } else {
          // Log the delete activity
          if (user && item) {
            await supabase.from("inventory_activity").insert({
              inventory_id: id,
              user_id: user.id,
              action: "deleted",
              item_name: item.name,
              changes: { stock: item.stock },
            });
          }
          refreshInventory();
        }
      } catch (err) {
        console.error("Error deleting item:", err);
        setError("Une erreur est survenue. Veuillez réessayer.");
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
      setFormData({ name: "", category: "", sku: decodedText, stock: 0, image_url: "" });
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

  if (inventoryLoading || actionLoading) {
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
        onAdd={role === 'admin' ? () => handleOpen() : undefined}
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
          onDelete={role === 'admin' ? handleDelete : undefined}
        />
      ) : (
        <InventoryGrid
          items={filteredItems}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          onEdit={handleOpen}
          onDelete={role === 'admin' ? handleDelete : undefined}
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
        role={role}
      />

      <StockAdjustmentDialog
        open={stockDialogOpen}
        item={editingItem}
        isMobile={isMobile}
        onClose={() => setStockDialogOpen(false)}
        onSave={handleStockSave}
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
