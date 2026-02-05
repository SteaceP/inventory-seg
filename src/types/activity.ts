/**
 * Actions that can be performed on an inventory item.
 */
export type ActivityAction = "created" | "updated" | "deleted";

/**
 * Represents a raw change record from the database.
 */
export interface ActivityRow {
  /** The action type */
  action?: string;
  /** JSON object containing the changes */
  changes?: Record<string, unknown>;
}

/**
 * Compact representation of an activity item for list views.
 */
export interface RecentActivityItem {
  /** Unique identifier for the activity */
  id: string;
  /** Type of action performed */
  action: ActivityAction;
  /** Name of the item at the time of the action */
  item_name: string;
  /** ISO timestamp of when the action occurred */
  created_at: string;
  /** Display name of the user who performed the action */
  user_display_name?: string;
}

/**
 * Detailed information about an inventory activity log entry.
 */
export interface InventoryActivity {
  /** Unique identifier for the activity log entry */
  id: string;
  /** Reference to the affected inventory item */
  inventory_id: string;
  /** Reference to the user who made the change */
  user_id: string | null;
  /** Type of action performed */
  action: ActivityAction;
  /** Name of the item at the time of the action */
  item_name: string;
  /** Detailed log of specific property changes */
  changes: {
    /** New stock level */
    stock?: number;
    /** Previous stock level */
    old_stock?: number;
    /** Current location name */
    location?: string;
    /** Parent location for hierarchical tracking */
    parent_location?: string;
    /** Type of stock movement */
    action_type?: "add" | "remove" | "adjust";
    [key: string]: unknown;
  };
  /** ISO timestamp of when the change was recorded */
  created_at: string;
  /** Display name of the actor */
  user_display_name?: string;
}
