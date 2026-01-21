import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useUserContext } from "../../contexts/UserContext";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useAlert } from "../../contexts/AlertContext";
import { useTranslation } from "../../i18n";
import { useErrorHandler } from "../useErrorHandler";
import { logActivity } from "../../utils/activityUtils";
import type { InventoryItem } from "../../types/inventory";
import {
  validateImageFile,
  generateSecureFileName,
  getExtensionFromMimeType,
} from "../../utils/crypto";

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

  const { role, lowStockThreshold: globalThreshold } = useUserContext();
  const { t } = useTranslation();
  const { showError } = useAlert();
  const { handleError } = useErrorHandler();

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
      const filePath = fileName;

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
          [key: string]: import("../../types/database.types").Json;
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
          session,
          handleError
        );
      }

      const updatedItem = items.find((i) => i.id === itemId);
      if (updatedItem) {
        void checkLowStockAndNotify({ ...updatedItem, stock: newStock });
      }

      // Note: We close stock dialog in parent usually, but this logic was embedded.
      // We might need to return success/callback.
      // Original code: setStockDialogOpen(false);
      // We will assume the parent handles closing OR we add a callback arg.
      // For now, let's return success promise.

      void refreshInventory();
      broadcastInventoryChange();
      setEditingId(null);
      return true; // Signal success
    } catch (err: unknown) {
      showError(
        t("inventory.updateStockError") + ": " + (err as Error).message
      );
      return false;
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
            session,
            handleError
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
    actionLoading,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleImageUpload,
    handleSave,
    handleStockSave,
    handleDeleteClick,
    handleDeleteConfirm,
  };
};
