import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUserContext } from "../contexts/UserContext";
import { useInventoryContext } from "../contexts/InventoryContext";
import { useAlert } from "../contexts/AlertContext";
import { useTranslation } from "../i18n";
import type { InventoryItem } from "../types/inventory";
import {
  validateImageFile,
  generateSecureFileName,
  generateSecureId,
  getExtensionFromMimeType,
} from "../utils/crypto";

// Helper to log activity via the Worker API
const logActivity = async (
  activity: {
    inventory_id: string;
    user_id: string;
    action: string;
    item_name: string;
    changes: unknown;
  },
  session: { access_token: string } | null
) => {
  try {
    await fetch("/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(activity),
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

export const useInventoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [actionLoading, setActionLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    sku: "",
    stock: 0,
    image_url: "",
    low_stock_threshold: null,
    notes: "",
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    () => new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLowStockFilter, setIsLowStockFilter] = useState(
    () => searchParams.get("filter") === "lowStock"
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    items,
    loading: inventoryLoading,
    refreshInventory,
    updateCategoryThreshold,
    categories,
    setEditingId,
    broadcastInventoryChange,
  } = useInventoryContext();
  const { role, lowStockThreshold: globalThreshold } = useUserContext();
  const { t } = useTranslation();
  const { showError } = useAlert();

  useEffect(() => {
    const filter = searchParams.get("filter");
    setIsLowStockFilter(filter === "lowStock");

    // Handle deep-linked actions
    const action = searchParams.get("action");
    if (action === "add") {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "",
        sku: "",
        stock: 0,
        image_url: "",
        low_stock_threshold: null,
        notes: "",
      });
      setOpen(true);
      // Clear action from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      setSearchParams(newParams, { replace: true });
    } else if (action === "scan") {
      setScanOpen(true);
      // Clear action from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  const handleOpen = useCallback((item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setOpenDrawer(true);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "",
        sku: "",
        stock: 0,
        image_url: "",
        low_stock_threshold: null,
        notes: "",
      });
      setOpen(true);
    }
  }, []);

  const handleAdjust = useCallback(
    (item: InventoryItem) => {
      setSelectedItem(item);
      setStockDialogOpen(true);
      setEditingId(item.id);
    },
    [setEditingId]
  );

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData(item);
    setOpenDrawer(false);
    setOpen(true);
    setEditingId(item.id);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const getBarcodeFormat = (sku: string) => {
    const cleanSku = sku.trim();
    if (/^\d{12}$/.test(cleanSku)) return "UPC" as const;
    if (/^\d{13}$/.test(cleanSku)) return "EAN13" as const;
    if (/^\d{8}$/.test(cleanSku)) return "EAN8" as const;
    return "CODE128" as const;
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
        const {
          data: { session },
        } = await supabase.auth.getSession();

        await fetch("/api/send-low-stock-alert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
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
      validateImageFile(file);
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

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
    } catch (err: unknown) {
      showError(t("errors.uploadImage") + ": " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockSave = async (
    itemId: string,
    newStock: number,
    location?: string,
    actionType?: "add" | "remove",
    parentLocation?: string,
    recipient?: string,
    destination_location?: string
  ) => {
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

      if (user) {
        const item = items.find((i) => i.id === itemId);
        const activityChanges: {
          [key: string]: import("../types/database.types").Json;
        } = {
          stock: newStock,
          old_stock: item?.stock ?? null,
        };

        if (actionType) activityChanges.action_type = actionType;
        if (location) activityChanges.location = location;
        if (parentLocation) activityChanges.parent_location = parentLocation;
        if (recipient) activityChanges.recipient = recipient;
        if (destination_location)
          activityChanges.destination_location = destination_location;

        if (destination_location)
          activityChanges.destination_location = destination_location;

        const {
          data: { session },
        } = await supabase.auth.getSession();

        void logActivity(
          {
            inventory_id: itemId,
            user_id: user.id,
            action: "updated",
            item_name: item?.name || "Unknown Item",
            changes: activityChanges,
          },
          session
        );
      }

      const updatedItem = items.find((i) => i.id === itemId);
      if (updatedItem) {
        void checkLowStockAndNotify({ ...updatedItem, stock: newStock });
      }

      setStockDialogOpen(false);
      void refreshInventory();
      broadcastInventoryChange();
      setEditingId(null);
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
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { stock_locations: _, ...inventoryData } = sanitizedData;

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
          .update(inventoryData)
          .eq("id", editingItem.id);

        if (error) {
          const pgError = error as { code?: string; message: string };
          if (pgError.code === "23505") {
            showError(t("errors.duplicateSku"));
          } else {
            showError(t("errors.updateItem") + ": " + pgError.message);
          }
          return;
        }

        if (user) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          void logActivity(
            {
              inventory_id: editingItem.id,
              user_id: user.id,
              action: "updated",
              item_name: sanitizedData.name,
              changes: { ...sanitizedData, old_stock: editingItem.stock },
            },
            session
          );
        }

        if (sanitizedData.stock_locations) {
          await supabase
            .from("inventory_stock_locations")
            .delete()
            .eq("inventory_id", editingItem.id);

          const locationsToInsert = sanitizedData.stock_locations
            .filter((l) => l.location && l.location.trim() !== "")
            .map((l) => ({
              inventory_id: editingItem.id,
              location: l.location!,
              quantity: l.quantity || 0,
              parent_location: l.parent_location,
            }));

          if (locationsToInsert.length > 0) {
            await supabase
              .from("inventory_stock_locations")
              .insert(locationsToInsert);
          }
        }
      } else {
        const { data, error } = (await supabase
          .from("inventory")
          .insert([
            inventoryData as import("../types/database.types").Database["public"]["Tables"]["inventory"]["Insert"],
          ])
          .select()
          .single()) as { data: unknown; error: unknown };

        const newItem = data as InventoryItem | null;

        if (error) {
          const pgError = error as { code?: string; message: string };
          if (pgError.code === "23505") {
            showError(t("errors.duplicateSku"));
          } else {
            showError(t("errors.addItem") + ": " + pgError.message);
          }
          return;
        }

        if (user && newItem) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          void logActivity(
            {
              inventory_id: newItem.id,
              user_id: user.id,
              action: "created",
              item_name: sanitizedData.name,
              changes: sanitizedData,
            },
            session
          );

          if (sanitizedData.stock_locations) {
            const locationsToInsert = sanitizedData.stock_locations
              .filter((l) => l.location && l.location.trim() !== "")
              .map((l) => ({
                inventory_id: newItem.id,
                location: l.location!,
                quantity: l.quantity || 0,
                parent_location: l.parent_location,
              }));

            if (locationsToInsert.length > 0) {
              await supabase
                .from("inventory_stock_locations")
                .insert(locationsToInsert);
            }
          }
        }
      }

      void checkLowStockAndNotify(sanitizedData);

      if (role === "admin" && sanitizedData.category) {
        const categoryExists = categories.some(
          (c) => c.name === sanitizedData.category
        );
        if (!categoryExists) {
          void updateCategoryThreshold(sanitizedData.category, null);
        }
      }

      handleClose();
      void refreshInventory();
      broadcastInventoryChange();
      setEditingId(null);
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
      const item = items.find((i) => i.id === id);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) {
        showError(t("errors.deleteItem") + ": " + error.message);
      } else {
        if (user) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          void logActivity(
            {
              inventory_id: id,
              user_id: user.id,
              action: "deleted",
              item_name: item?.name || "Unknown",
              changes: { id },
            },
            session
          );
        }
        void refreshInventory();
        broadcastInventoryChange();
      }
    } catch (err: unknown) {
      showError(t("inventory.deleteItemError") + ": " + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const generateSKU = () => {
    const sku = generateSecureId();
    setFormData((prev) => ({ ...prev, sku }));
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

    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }

    if (isLowStockFilter) {
      const categoryThreshold = categories.find(
        (c) => c.name === item.category
      )?.low_stock_threshold;
      const effectiveThreshold =
        item.low_stock_threshold ?? categoryThreshold ?? globalThreshold;
      return (
        matchesSearch &&
        (item.stock || 0) <= effectiveThreshold &&
        (item.stock || 0) > 0
      );
    }

    if (searchParams.get("filter") === "outOfStock") {
      return matchesSearch && (item.stock || 0) === 0;
    }

    return matchesSearch;
  });

  return {
    items,
    inventoryLoading,
    actionLoading,
    open,
    stockDialogOpen,
    categoriesDialogOpen,
    scanOpen,
    editingItem,
    formData,
    selectedItems,
    searchQuery,
    isLowStockFilter,
    deleteConfirmOpen,
    historyDialogOpen,
    selectedItemForHistory,
    openDrawer,
    selectedItem,
    currentTab,
    selectedCategory,
    filteredItems,
    role,
    globalThreshold,
    categories,
    setSearchQuery,
    setOpen,
    setStockDialogOpen,
    setCategoriesDialogOpen,
    setScanOpen,
    setFormData,
    setSelectedItems,
    setDeleteConfirmOpen,
    setHistoryDialogOpen,
    setSelectedItemForHistory,
    setOpenDrawer,
    setCurrentTab,
    setSelectedCategory,
    toggleLowStockFilter,
    handleOpen,
    handleAdjust,
    handleEdit,
    handleClose,
    getBarcodeFormat,
    handleImageUpload,
    handleStockSave,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    generateSKU,
    handleScanSuccess,
    toggleItem,
    refreshInventory,
    setSearchParams,
    searchParams,
  };
};
