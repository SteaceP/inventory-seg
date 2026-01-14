-- Add location tracking to inventory and appliances

-- 1. Add location column to inventory table
alter table public.inventory add column if not exists location text;

-- 2. Add location column to appliances table
alter table public.appliances add column if not exists location text;
