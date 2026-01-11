import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUserContext } from "../contexts/useUserContext";
import { useTranslation } from "../i18n";
import { useInventoryContext } from "../contexts/useInventoryContext";
import { useAlert } from "../contexts/useAlertContext";
import BarcodePrinter from "../components/BarcodePrinter";
import type { InventoryItem } from "../types/inventory";
import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryGrid from "../components/inventory/InventoryGrid";
import InventoryDialog from "../components/inventory/InventoryDialog";
import InventoryScanner from "../components/inventory/InventoryScanner";
import StockAdjustmentDialog from "../components/inventory/StockAdjustmentDialog";

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
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery] = useState("");
  const [isLowStockFilter, setIsLowStockFilter] = useState(
    searchParams.get("filter") === "lowStock"
  );
  const { role, lowStockThreshold } = useUserContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = !isTablet;

  const { t } = useTranslation();
  const { showError } = useAlert();

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "lowStock") {
      setIsLowStockFilter(true);
    }
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

  const fetchServerRows = async ({
    page,
    pageSize,
    search,
    sortField,
    sortDir,
  }: {
    page: number;
    pageSize: number;
    search?: string;
    sortField?: string;
    sortDir?: "asc" | "desc";
  }) => {
    try {
      let query = supabase.from("inventory").select("*", { count: "exact" });

      if (isLowStockFilter) {
        query = query.lte("stock", lowStockThreshold);
      }

      // Search across name, sku, category when provided
      if (search && search.trim().length > 0) {
        const q = `%${search.trim()}%`;
        query = query.or(`name.ilike.${q},sku.ilike.${q},category.ilike.${q}`);
      }

      // Sorting
      if (sortField) {
        query = query.order(sortField, { ascending: sortDir !== "desc" });
      } else {
        query = query.order("name", { ascending: true });
      }

      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      return {
        rows: (data || []) as InventoryItem[],
        total: count ?? (data || []).length,
      };
    } catch (err: unknown) {
      showError(
        t("inventory.fetchServerError") + ": " + (err as Error).message
      );
      return { rows: [], total: 0 };
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

      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const isLowStock =
        (item.stock || 0) <= (userSettings?.low_stock_threshold ?? 5);

      if (isLowStock) {
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
              userId: user.id,
            }),
          });
        }
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
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
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
        checkLowStockAndNotify({ ...updatedItem, stock: newStock });
      }

      setStockDialogOpen(false);
      refreshInventory();
    } catch (err: unknown) {
      showError(
        t("inventory.updateStockError") + ": " + (err as Error).message
      );
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
        const { data: newItem, error } = await supabase
          .from("inventory")
          .insert([sanitizedData])
          .select()
          .single();

        if (error) {
          showError(t("errors.addItem") + ": " + error.message);
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
    } catch (err: unknown) {
      showError(t("inventory.saveItemError") + ": " + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("inventory.deleteConfirm"))) {
      try {
        // Get item name before deleting
        const item = items.find((i) => i.id === id);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { error } = await supabase
          .from("inventory")
          .delete()
          .eq("id", id);
        if (error) {
          showError(t("errors.deleteItem") + ": " + error.message);
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
      } catch (err: unknown) {
        showError(
          t("inventory.deleteItemError") + ": " + (err as Error).message
        );
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
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      (item.sku && item.sku.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query));

    if (isLowStockFilter) {
      return matchesSearch && item.stock <= lowStockThreshold;
    }
    return matchesSearch;
  });

  if (inventoryLoading || actionLoading) {
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
      />

      {!isTablet ? (
        <InventoryTable
          items={filteredItems}
          selectedItems={selectedItems}
          onToggleAll={toggleAll}
          onToggleItem={toggleItem}
          onEdit={handleOpen}
          onDelete={role === "admin" ? handleDelete : undefined}
          fetchServerRows={fetchServerRows}
          searchQuery={searchQuery}
          isDesktop={isDesktop}
          isLowStockFilter={isLowStockFilter}
        />
      ) : (
        <InventoryGrid
          items={filteredItems}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          onEdit={handleOpen}
          onDelete={role === "admin" ? handleDelete : undefined}
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
        onError={(msg) => showError(t("inventory.scanError") + ": " + msg)}
      />

      <BarcodePrinter items={items.filter((i) => selectedItems.has(i.id))} />
    </Box>
  );
};

export default Inventory;
