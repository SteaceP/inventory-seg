import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUserContext } from "../contexts/useUserContext";
import { useThemeContext } from "../contexts/useThemeContext";
import { useTranslation } from "../i18n";
import { useInventoryContext } from "../contexts/useInventoryContext";
import { useAlert } from "../contexts/useAlertContext";
import BarcodePrinter from "../components/BarcodePrinter";
import type { InventoryItem } from "../types/inventory";
import {
  validateImageFile,
  generateSecureFileName,
  generateSecureId,
  getExtensionFromMimeType,
} from "../utils/crypto";
import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryCategorizedGrid from "../components/inventory/InventoryCategorizedGrid";
import InventoryDialog from "../components/inventory/InventoryDialog";
import InventoryScanner from "../components/inventory/InventoryScanner";
import StockAdjustmentDialog from "../components/inventory/StockAdjustmentDialog";
import ConfirmDialog from "../components/ConfirmDialog";

const Inventory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    items,
    loading: inventoryLoading,
    refreshInventory,
  } = useInventoryContext();
  const [actionLoading, setActionLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    sku: "",
    stock: 0,
    image_url: "",
    low_stock_threshold: null,
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    () => new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLowStockFilter, setIsLowStockFilter] = useState(
    searchParams.get("filter") === "lowStock"
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { role, lowStockThreshold: globalThreshold } = useUserContext();
  const { categories } = useInventoryContext();
  const { compactView } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { t } = useTranslation();
  const { showError } = useAlert();

  useEffect(() => {
    const filter = searchParams.get("filter");
    setIsLowStockFilter(filter === "lowStock");
  }, [searchParams]);

  const toggleLowStockFilter = () => {
    const newValue = !isLowStockFilter;
    setIsLowStockFilter(newValue);
    if (newValue) {
      setSearchParams({ filter: "lowStock" });
    } else {
      searchParams.delete("filter");
      setSearchParams(searchParams);
    }
  };

  const handleOpen = React.useCallback(
    (item?: InventoryItem) => {
      if (role === "user" && item) {
        setEditingItem(item);
        setStockDialogOpen(true);
        return;
      }

      if (item) {
        setEditingItem(item);
        setFormData(item);
      } else {
        setEditingItem(null);
        setFormData({
          name: "",
          category: "",
          sku: "",
          stock: 0,
          image_url: "",
          low_stock_threshold: null,
        });
      }
      setOpen(true);
    },
    [role]
  );

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const categoryThreshold = categories.find(
        (c) => c.name === item.category
      )?.low_stock_threshold;

      const effectiveThreshold =
        item.low_stock_threshold ?? categoryThreshold ?? globalThreshold;

      const isLowStock = (item.stock || 0) <= effectiveThreshold;

      if (isLowStock) {
        // Call the Alerter API (handles both Push and Email)
        await fetch("/api/send-low-stock-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: item.name,
            currentStock: item.stock,
            threshold: effectiveThreshold,
            userEmail: user.email,
            userId: user.id,
          }),
        });
      }
    } catch (err: unknown) {
      showError(
        t("inventory.lowStockAlertError") + ": " + (err as Error).message
      );
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setActionLoading(true);

      // Validate file type and size
      validateImageFile(file);

      // Get proper extension from MIME type
      const ext = getExtensionFromMimeType(file.type);
      const fileName = generateSecureFileName(ext);
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("inventory-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("inventory-images").getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err: unknown) {
      showError(t("errors.uploadImage") + ": " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockSave = async (itemId: string, newStock: number) => {
    try {
      setActionLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("inventory")
        .update({ stock: newStock })
        .eq("id", itemId);

      if (error) throw error;

      // Log the stock update activity
      if (user) {
        const item = items.find((i) => i.id === itemId);
        await supabase.from("inventory_activity").insert({
          inventory_id: itemId,
          user_id: user.id,
          action: "updated",
          item_name: item?.name || "Unknown Item",
          changes: { stock: newStock, old_stock: item?.stock },
        });
      }

      const updatedItem = items.find((i) => i.id === itemId);
      if (updatedItem) {
        void checkLowStockAndNotify({ ...updatedItem, stock: newStock });
      }

      setStockDialogOpen(false);
      void refreshInventory();
    } catch (err: unknown) {
      showError(
        t("inventory.updateStockError") + ": " + (err as Error).message
      );
    } finally {
      setActionLoading(false);
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
      showError(t("inventory.nameRequired"));
      return;
    }

    try {
      setActionLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (editingItem) {
        const { error } = await supabase
          .from("inventory")
          .update(sanitizedData)
          .eq("id", editingItem.id);

        if (error) {
          showError(t("errors.updateItem") + ": " + error.message);
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
        const { data, error } = (await supabase
          .from("inventory")
          .insert([sanitizedData])
          .select()
          .single()) as { data: unknown; error: unknown };

        const newItem = data as InventoryItem | null;

        if (error) {
          showError(
            t("errors.addItem") + ": " + (error as { message: string }).message
          );
          return;
        }

        // Log the create activity
        if (user && newItem) {
          void supabase.from("inventory_activity").insert({
            inventory_id: newItem.id,
            user_id: user.id,
            action: "created",
            item_name: sanitizedData.name,
            changes: sanitizedData,
          });
        }
      }

      void checkLowStockAndNotify(sanitizedData);
      handleClose();
      void refreshInventory();
    } catch (err: unknown) {
      showError(t("inventory.saveItemError") + ": " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;
    setDeleteConfirmOpen(false);
    setItemToDelete(null);

    try {
      setActionLoading(true);
      // Get item name before deleting
      const item = items.find((i) => i.id === id);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) {
        showError(t("errors.deleteItem") + ": " + error.message);
      } else {
        // Log the delete activity
        if (user) {
          void supabase.from("inventory_activity").insert({
            inventory_id: id,
            user_id: user.id,
            action: "deleted",
            item_name: item?.name || "Unknown",
            changes: { id },
          });
        }
        void refreshInventory();
      }
    } catch (err: unknown) {
      showError(t("inventory.deleteItemError") + ": " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const generateSKU = () => {
    const sku = generateSecureId();
    setFormData({ ...formData, sku });
  };

  const handleScanSuccess = (decodedText: string) => {
    setScanOpen(false);
    const item = items.find((i) => i.sku === decodedText);
    if (item) {
      handleOpen(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "",
        sku: decodedText,
        stock: 0,
        image_url: "",
      });
      setOpen(true);
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
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      (item.sku && item.sku.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query));

    if (isLowStockFilter) {
      const categoryThreshold = categories.find(
        (c) => c.name === item.category
      )?.low_stock_threshold;
      const effectiveThreshold =
        item.low_stock_threshold ?? categoryThreshold ?? globalThreshold;
      return matchesSearch && (item.stock || 0) <= effectiveThreshold;
    }
    return matchesSearch;
  });

  if (inventoryLoading) {
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
    <Box sx={{ p: 0 }}>
      <InventoryHeader
        isMobile={isMobile}
        selectedCount={selectedItems.size}
        onPrint={() => window.print()}
        onScan={() => setScanOpen(true)}
        onAdd={role === "admin" ? () => handleOpen() : undefined}
        isLowStockFilter={isLowStockFilter}
        onToggleLowStock={toggleLowStockFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <InventoryCategorizedGrid
        items={filteredItems}
        selectedItems={selectedItems}
        onToggleItem={toggleItem}
        onEdit={handleOpen}
        onDelete={role === "admin" ? (id) => handleDeleteClick(id) : undefined}
        compactView={compactView}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t("inventory.delete") || "Delete Item"}
        content={t("inventory.deleteConfirm")}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <InventoryDialog
        open={open}
        editingItem={editingItem}
        formData={formData}
        isMobile={isMobile}
        onClose={handleClose}
        onSave={() => void handleSave()}
        onFormDataChange={setFormData}
        onGenerateSKU={generateSKU}
        onImageUpload={(file) => void handleImageUpload(file)}
        getBarcodeFormat={getBarcodeFormat}
        role={role}
        loading={actionLoading}
      />

      <StockAdjustmentDialog
        open={stockDialogOpen}
        item={editingItem}
        isMobile={isMobile}
        onClose={() => setStockDialogOpen(false)}
        onSave={(itemId, newStock) => void handleStockSave(itemId, newStock)}
        loading={actionLoading}
      />

      <InventoryScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={(msg) => showError(t("inventory.scanError") + ": " + msg)}
      />

      <BarcodePrinter items={items.filter((i) => selectedItems.has(i.id))} />
    </Box>
  );
};

export default Inventory;
