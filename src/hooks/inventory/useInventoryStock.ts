import { supabase } from "../../supabaseClient";
import { useInventoryContext } from "../../contexts/InventoryContext";
import { useUserContext } from "../../contexts/UserContext";
import { useAlert } from "../../contexts/AlertContext";
import { useTranslation } from "../../i18n";
import { useErrorHandler } from "../useErrorHandler";
import { logActivity } from "../../utils/activityUtils";
import type { InventoryItem } from "../../types/inventory";

export const useInventoryStock = () => {
  const { items, refreshInventory, broadcastInventoryChange, categories } =
    useInventoryContext();
  const { lowStockThreshold: globalThreshold } = useUserContext();
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
        const activityChanges: Record<
          string,
          import("../../types/database.types").Json
        > = {
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

      void refreshInventory();
      broadcastInventoryChange();
      return true;
    } catch (err: unknown) {
      showError(
        t("inventory.updateStockError") + ": " + (err as Error).message
      );
      return false;
    }
  };

  return { handleStockSave, checkLowStockAndNotify };
};
