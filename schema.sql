-- Create the inventory table
create table public.inventory (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  sku text unique,
  stock integer default 0,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.inventory enable row level security;

-- Drop old policies
drop policy if exists "Allow authenticated actions" on public.inventory;
drop policy if exists "Allow authenticated select" on public.inventory;
drop policy if exists "Allow authenticated insert" on public.inventory;
drop policy if exists "Allow authenticated update" on public.inventory;
drop policy if exists "Allow authenticated delete" on public.inventory;
drop policy if exists "Admin full access" on public.inventory;
drop policy if exists "Admin insert access" on public.inventory;
drop policy if exists "Admin update access" on public.inventory;
drop policy if exists "Admin delete access" on public.inventory;
drop policy if exists "User view access" on public.inventory;
drop policy if exists "User stock update" on public.inventory;
drop policy if exists "Authenticated update access" on public.inventory;

-- Admin full access policy
-- Admin access policies (Split to avoid overlapping SELECT with "User view access")
create policy "Admin insert access" on public.inventory
  for insert
  to authenticated
  with check (
    EXISTS (
      SELECT 1 FROM public.user_settings
      WHERE user_id = (select auth.uid()) AND role = 'admin'
    )
  );

create policy "Authenticated update access" on public.inventory
  for update
  to authenticated
  using (
    EXISTS (
      SELECT 1 FROM public.user_settings
      WHERE user_id = (select auth.uid())
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM public.user_settings
      WHERE user_id = (select auth.uid())
    )
  );

create policy "Admin delete access" on public.inventory
  for delete
  to authenticated
  using (
    EXISTS (
      SELECT 1 FROM public.user_settings
      WHERE user_id = (select auth.uid()) AND role = 'admin'
    )
  );

-- User can view all items
create policy "User view access" on public.inventory
  for select
  to authenticated
  using (true);

-- User can only update stock field
-- "User stock update" consolidated into "Authenticated update access"

-- Storage Setup (Production Ready)
-- 1. Create the bucket
-- insert into storage.buckets (id, name, public) values ('inventory-images', 'inventory-images', true);

-- 2. Allow anyone to view images (public lookup)
-- create policy "Public image viewing" on storage.objects for select using ( bucket_id = 'inventory-images' );

-- 3. Only authenticated users can upload, update or delete
-- create policy "Authenticated image management" on storage.objects for all to authenticated using ( bucket_id = 'inventory-images' );

-- Migration command for existing tables:
-- ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS image_url text;
-- ALTER TABLE public.inventory DROP COLUMN IF EXISTS price;

-- Create user_settings table if it doesn't exist
create table if not exists public.user_settings (
  user_id uuid references auth.users on delete cascade primary key,
  display_name text,
  notifications boolean default true,
  email_alerts boolean default false,
  low_stock_threshold integer default 5,
  dark_mode boolean default true,
  compact_view boolean default false,
  avatar_url text,
  role text default 'admin' check (role in ('admin', 'user')),
  updated_at timestamp with time zone default now()
);

-- Ensure role column exists (for existing tables)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'user_settings' and column_name = 'role') then
    alter table public.user_settings add column role text default 'admin' check (role in ('admin', 'user'));
  end if; 
end $$;

-- Storage Setup for Avatars (Run in Supabase SQL Editor if not exists)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- create policy "Avatar viewing" on storage.objects for select using ( bucket_id = 'avatars' );
-- create policy "Avatar management" on storage.objects for all to authenticated using ( bucket_id = 'avatars' );

-- Enable RLS for user_settings
alter table public.user_settings enable row level security;

-- Optimized RLS policies for user_settings
-- Using (select auth.uid()) is a performance optimization for Supabase to prevent re-evaluation for every row
-- Dropping specific policies to consolidate into one 'ALL' policy
drop policy if exists "Users can update own settings" on public.user_settings;
drop policy if exists "Users can view own settings" on public.user_settings;
drop policy if exists "Users can insert own settings" on public.user_settings;
drop policy if exists "Users can delete own settings" on public.user_settings;
drop policy if exists "Users can manage own settings" on public.user_settings;
drop policy if exists "Users can modify own settings" on public.user_settings;

create policy "Users can modify own settings" on public.user_settings
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update own settings" on public.user_settings
  for update
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can delete own settings" on public.user_settings
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Allow authenticated users to view all profiles (needed for dashboard activity)
drop policy if exists "Authenticated can view all profiles" on public.user_settings;
create policy "Authenticated can view all profiles" on public.user_settings
  for select
  to authenticated
  using (true);

-- Function to update the updated_at column
-- Setting search_path to empty and using explicit schema for now() is the most secure approach
drop function if exists public.update_updated_at_column() cascade;
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

-- Trigger for user_settings
drop trigger if exists update_user_settings_updated_at on public.user_settings;
create trigger update_user_settings_updated_at
  before update on public.user_settings
  for each row
  execute function public.update_updated_at_column();

-- ==========================================
-- REALTIME OPTIMIZATIONS
-- ==========================================

-- 1. Optimize Replica Identity (Reduces WAL volume and processing time)
-- By setting to DEFAULT, only the primary key and changed columns are logged
ALTER TABLE public.inventory REPLICA IDENTITY DEFAULT;
ALTER TABLE public.user_settings REPLICA IDENTITY DEFAULT;

-- 2. Refine Realtime Publication
-- Limit real-time processing to only what is strictly necessary
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- Add tables that require real-time synchronization
-- Theme, compact view, and profile updates are synced via user_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;

-- 3. Explicitly set timezone to prevent discovery probes (Speed up connections)
-- This avoids the expensive 'select name from pg_timezone_names' query
ALTER ROLE postgres SET timezone TO 'UTC';
ALTER ROLE authenticator SET timezone TO 'UTC';
ALTER ROLE authenticated SET timezone TO 'UTC';
ALTER ROLE anon SET timezone TO 'UTC';

-- 4. Disable JIT for management roles to speed up complex introspection (Dashboard/API)
-- For metadata-heavy queries, JIT compilation overhead can exceed execution time
ALTER ROLE postgres SET jit = off;
ALTER ROLE authenticator SET jit = off;
ALTER ROLE authenticated SET jit = off;
ALTER ROLE anon SET jit = off;

-- Uncomment the following line if you need real-time updates for the inventory grid/table
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;

-- ==========================================
-- ACTIVITY TRACKING
-- ==========================================

-- Create inventory_activity table to log all inventory changes
create table if not exists public.inventory_activity (
  id uuid default gen_random_uuid() primary key,
  inventory_id uuid references public.inventory(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  item_name text not null,
  changes jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS for activity tracking
alter table public.inventory_activity enable row level security;

-- Allow authenticated users to view all activity
drop policy if exists "Allow authenticated to view activity" on public.inventory_activity;
create policy "Allow authenticated to view activity" on public.inventory_activity
  for select
  to authenticated
  using (true);

-- Allow authenticated users to insert activity logs
drop policy if exists "Allow authenticated to insert activity" on public.inventory_activity;
create policy "Allow authenticated to insert activity" on public.inventory_activity
  for insert
  to authenticated
  with check (true);

-- Create index for performance when fetching recent activities
create index if not exists idx_inventory_activity_created_at 
  on public.inventory_activity(created_at desc);




-- ==========================================
-- APPLIANCES & REPAIRS TRACKING
-- ==========================================

-- 1. Create appliances table
create table if not exists public.appliances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text,
  brand text,
  model text,
  serial_number text,
  purchase_date date,
  warranty_expiry date,
  notes text,
  photo_url text,
  sku text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Create repairs table
create table if not exists public.repairs (
  id uuid default gen_random_uuid() primary key,
  appliance_id uuid references public.appliances(id) on delete cascade not null,
  repair_date date default CURRENT_DATE,
  description text not null,
  cost numeric(10, 2),
  service_provider text,
  created_at timestamp with time zone default now()
);

-- 3. Enable RLS
alter table public.appliances enable row level security;
alter table public.repairs enable row level security;

-- 4. RLS Policies for Appliances
-- Users can manage their own appliances
create policy "Users can manage own appliances" on public.appliances
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 5. RLS Policies for Repairs
-- Users can manage repairs for appliances they own
create policy "Users can manage own repairs" on public.repairs
  for all to authenticated
  using (
    exists (
      select 1 from public.appliances
      where id = repairs.appliance_id
      and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.appliances
      where id = appliance_id -- check the NEW appliance_id
      and user_id = auth.uid()
    )
  );

-- 6. Trigger for updated_at on appliances
drop trigger if exists update_appliances_updated_at on public.appliances;
create trigger update_appliances_updated_at
  before update on public.appliances
  for each row
  execute function public.update_updated_at_column();

-- 7. Add to Realtime Publication
alter publication supabase_realtime add table public.appliances;
alter publication supabase_realtime add table public.repairs;
