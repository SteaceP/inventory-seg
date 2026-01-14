-- Enable real-time for inventory_activity to support global notifications
alter publication supabase_realtime add table public.inventory_activity;
