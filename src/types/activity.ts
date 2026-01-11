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
