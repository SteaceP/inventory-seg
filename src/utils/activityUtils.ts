import type { InventoryActivity } from "@/types/activity";

/**
 * Calculates the difference between old and new stock levels.
 *
 * @param changes - The changes object from an inventory activity log.
 * @returns An object with diff, old/new levels, and a color recommendation, or null if no change.
 */
export const getStockChange = (changes: InventoryActivity["changes"]) => {
  const oldStock = Number(changes?.old_stock) || 0;
  const newStock = Number(changes?.stock) || 0;
  const diff = newStock - oldStock;

  if (diff === 0) return null;

  return {
    diff,
    oldStock,
    newStock,
    color: diff > 0 ? "success" : "error",
  };
};

/**
 * Generates a human-readable narrative string for an inventory activity.
 *
 * @param activity - The inventory activity object.
 * @param t - Translation function for localization.
 * @returns A localized string describing the activity.
 */
export const getActivityNarrative = (
  activity: InventoryActivity,
  t: (
    key: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ) => string
) => {
  const { action, changes, item_name, user_display_name: user } = activity;
  const stockChange = getStockChange(changes);
  const count = stockChange ? Math.abs(stockChange.diff) : 0;
  const location = changes?.location;
  const parent = changes?.parent_location;

  const locationStr = [parent, location].filter(Boolean).join(" ");

  if (action === "created") {
    return t("inventory.activity.narrative.created", {
      user: user || "System",
      item: item_name || "Unknown Item",
    });
  }
  if (action === "deleted") {
    return t("inventory.activity.narrative.deleted", {
      user: user || "System",
      item: item_name || "Unknown Item",
    });
  }

  const actionType = changes?.action_type;
  if (actionType === "add") {
    return t("inventory.activity.narrative.stockAdded", {
      user: user || "System",
      count: count || 0,
      item: item_name || "Unknown Item",
      location: locationStr || "System",
    });
  }
  if (actionType === "remove") {
    const recipient = changes?.recipient as string | undefined;
    const destination = changes?.destination_location as string | undefined;

    if (recipient && destination) {
      return t("inventory.activity.narrative.stockRemovedFull", {
        user: user || "System",
        count: count || 0,
        item: item_name || "Unknown Item",
        recipient,
        destination,
      });
    }
    if (recipient) {
      return t("inventory.activity.narrative.stockRemovedRecipient", {
        user: user || "System",
        count: count || 0,
        item: item_name || "Unknown Item",
        recipient,
      });
    }
    return t("inventory.activity.narrative.stockRemoved", {
      user: user || "System",
      count: count || 0,
      item: item_name || "Unknown Item",
      location: locationStr || "System",
    });
  }

  return t("inventory.activity.narrative.updated", {
    user: user || "System",
    item: item_name || "Unknown Item",
  });
};

/**
 * POSTs an activity log entry to the edge function.
 *
 * @param activity - Activity data to log.
 * @param session - Current auth session for token authorization.
 * @param handleError - Error handling callback.
 */
export const logActivity = async (
  activity: {
    inventory_id: string;
    user_id: string;
    action: string;
    item_name: string;
    changes: unknown;
  },
  session: { access_token: string } | null,
  handleError: (error: unknown) => void
) => {
  if (!session?.access_token) return;
  try {
    await fetch("/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(activity),
    });
  } catch (err) {
    handleError(err);
  }
};
