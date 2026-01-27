CREATE TABLE IF NOT EXISTS inventory_activity (
  id TEXT PRIMARY KEY,
  inventory_id TEXT,
  user_id TEXT,
  action TEXT,
  item_name TEXT,
  changes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
