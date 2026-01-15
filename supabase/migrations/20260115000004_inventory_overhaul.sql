-- Migration to add unit_cost and notes to inventory table
alter table public.inventory add column if not exists unit_cost decimal(12,2) default 0;
alter table public.inventory add column if not exists notes text;

-- Update the activity tracking checks to handle new fields if necessary
-- (No changes needed to inventory_activity table as it uses jsonb for changes)
