import { useState } from "react";

import { useTranslation } from "@/i18n";
import { supabase } from "@/supabaseClient";
import type { InventoryItem } from "@/types/inventory";

import { useAlert } from "@contexts/AlertContext";
import { useInventoryContext } from "@contexts/InventoryContext";
import { useUserContext } from "@contexts/UserContextDefinition";
import { logActivity } from "@utils/activityUtils";

import { useErrorHandler } from "../useErrorHandler";
import { useInventoryImage } from "./useInventoryImage";
import { useInventoryStock } from "./useInventoryStock";

interface UseInventoryActionsProps {
  formData: Partial<InventoryItem>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<InventoryItem>>>;
  editingItem: InventoryItem | null;
  setOpen: (open: boolean) => void;
  setEditingId: (id: string | null) => void;
}

export const useInventoryActions = ({
  formData,
  setFormData,
  editingItem,
  setOpen,
  setEditingId,
}: UseInventoryActionsProps) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    items,
    refreshInventory,
    updateCategoryThreshold,
    categories,
    broadcastInventoryChange,
  } = useInventoryContext();

  const { role } = useUserContext();
  const { t } = useTranslation();
  const { showError } = useAlert();
  const { handleError } = useErrorHandler();

  const { handleImageUpload, uploading } = useInventoryImage(setFormData);
  const { handleStockSave, checkLowStockAndNotify } = useInventoryStock();

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
            session,
            handleError
          );
        }

        if (sanitizedData.stock_locations) {
          const { error: delError } = await supabase
            .from("inventory_stock_locations")
            .delete()
            .eq("inventory_id", editingItem.id);

          if (delError) throw delError;

          const locationsToInsert = sanitizedData.stock_locations
            .filter((l) => l.location && l.location.trim() !== "")
            .map((l) => ({
              inventory_id: editingItem.id,
              location: l.location!,
              quantity: l.quantity || 0,
              parent_location: l.parent_location,
            }));

          if (locationsToInsert.length > 0) {
            const { error: insError } = await supabase
              .from("inventory_stock_locations")
              .insert(locationsToInsert);

            if (insError) throw insError;
          }
        }
      } else {
        const { data, error } = (await supabase
          .from("inventory")
          .insert([
            inventoryData as import("../../types/database.types").Database["public"]["Tables"]["inventory"]["Insert"],
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
            session,
            handleError
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
              const { error: locInsError } = await supabase
                .from("inventory_stock_locations")
                .insert(locationsToInsert);

              if (locInsError) throw locInsError;
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

      setOpen(false);
      setEditingId(null);
      void refreshInventory();
      broadcastInventoryChange();
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
            session,
            handleError
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

  return {
    actionLoading: actionLoading || uploading,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleImageUpload,
    handleSave,
    handleStockSave: async (...args: Parameters<typeof handleStockSave>) => {
      const result = await handleStockSave(...args);
      if (result) setEditingId(null);
      return result;
    },
    handleDeleteClick,
    handleDeleteConfirm,
  };
};
