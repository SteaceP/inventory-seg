export type ActivityAction = "created" | "updated" | "deleted";

export interface ActivityRow {
  action?: string;
  changes?: Record<string, unknown>;
}

export interface RecentActivityItem {
  id: string;
  action: ActivityAction;
  item_name: string;
  created_at: string;
  user_display_name?: string;
}

export interface InventoryActivity {
  id: string;
  inventory_id: string;
  user_id: string | null;
  action: ActivityAction;
  item_name: string;
  changes: {
    stock?: number;
    old_stock?: number;
    location?: string;
    parent_location?: string;
    action_type?: "add" | "remove" | "adjust";
    [key: string]: unknown;
  };
  created_at: string;
  user_display_name?: string;
}
