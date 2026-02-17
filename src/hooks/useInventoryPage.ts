import { useState, useEffect, useCallback } from "react";

import { useSearchParams } from "react-router-dom";

import type { InventoryItem } from "@/types/inventory";

import { useInventoryContext } from "@contexts/InventoryContext";
import { useUserContext } from "@contexts/UserContext";
import { getBarcodeFormat } from "@utils/inventoryUtils";

import { useInventoryActions } from "./inventory/useInventoryActions";
import { useInventoryFilter } from "./inventory/useInventoryFilter";
import { useInventoryForm } from "./inventory/useInventoryForm";

/**
 * Orchestrator hook for the Inventory page.
 * Aggregates filtering, form management, and CRUD actions for inventory items.
 *
 * @returns A comprehensive state and action object for the Inventory UI.
 */
export const useInventoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    () => new Set()
  );
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const {
    items,
    loading: inventoryLoading,
    refreshInventory,
    categories,
    setEditingId,
  } = useInventoryContext();

  const { role, lowStockThreshold: globalThreshold } = useUserContext();

  // --- Sub-Hooks ---

  // 1. Filtering Logic
  const {
    searchQuery,
    setSearchQuery,
    isLowStockFilter,
    toggleLowStockFilter,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
  } = useInventoryFilter({ items, categories, globalThreshold });

  // 2. Form & Dialog Logic
  const {
    open,
    setOpen,
    editingItem,
    // setEditingItem, // Unused
    formData,
    setFormData,
    handleOpen: baseHandleOpen,
    handleEdit: baseHandleEdit,
    handleClose: baseHandleClose,
    generateSKU,
  } = useInventoryForm(setEditingId);

  // 3. Actions (CRUD)
  const {
    actionLoading,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleImageUpload,
    handleSave,
    handleStockSave: baseHandleStockSave,
    handleDeleteClick,
    handleDeleteConfirm,
  } = useInventoryActions({
    formData,
    setFormData,
    editingItem,
    setOpen,
    setEditingId,
  });

  // --- Page Specific Logic ---

  // Extended Handlers
  const handleOpen = useCallback(
    (item?: InventoryItem) => {
      if (item) {
        setSelectedItem(item);
        setOpenDrawer(true);
      } else {
        baseHandleOpen();
      }
    },
    [baseHandleOpen]
  );

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      setScanOpen(false);
      const item = items.find((i) => i.sku === decodedText);
      if (item) {
        handleOpen(item);
      } else {
        // Open form with pre-filled SKU
        baseHandleOpen();
        setFormData((prev) => ({ ...prev, sku: decodedText }));
      }
    },
    [items, handleOpen, baseHandleOpen, setFormData]
  );

  // Deep Linking
  useEffect(() => {
    // Handle deep-linked actions
    const action = searchParams.get("action");
    if (action === "add") {
      setTimeout(() => baseHandleOpen(), 0); // Open empty form
      // Clear action from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      setSearchParams(newParams, { replace: true });
    } else if (action === "scan") {
      setTimeout(() => setScanOpen(true), 0);
      // Clear action from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      setSearchParams(newParams, { replace: true });
    }

    const scanResult = searchParams.get("scanResult");
    if (scanResult) {
      setTimeout(() => handleScanSuccess(scanResult), 0);
      // Clear scanResult from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("scanResult");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, baseHandleOpen, handleScanSuccess]);

  // Wrapper to handle closing drawer before opening edit dialog
  const handleEdit = useCallback(
    (item: InventoryItem) => {
      setOpenDrawer(false);
      baseHandleEdit(item);
    },
    [baseHandleEdit]
  );

  const handleClose = useCallback(() => {
    baseHandleClose();
    // Also reset any page-specific state if needed
  }, [baseHandleClose]);

  const handleAdjust = useCallback(
    (item: InventoryItem) => {
      setSelectedItem(item);
      setStockDialogOpen(true);
      setEditingId(item.id);
    },
    [setEditingId]
  );

  // Wrap stock save to close local dialog
  const handleStockSave = async (
    ...args: Parameters<typeof baseHandleStockSave>
  ) => {
    const success = await baseHandleStockSave(...args);
    if (success) {
      setStockDialogOpen(false);
    }
    return success; // Return promise<boolean>
  };

  const attemptStockSave = async (
    itemId: string,
    newStock: number,
    location?: string,
    actionType?: "add" | "remove",
    parentLocation?: string,
    recipient?: string,
    destination_location?: string
  ) => {
    await handleStockSave(
      itemId,
      newStock,
      location,
      actionType,
      parentLocation,
      recipient,
      destination_location
    );
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

  // getBarcodeFormat moved to inventoryUtils.ts

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
    handleStockSave: attemptStockSave, // Use the wrapper
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
