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

-- Create policy to allow all actions for AUTHENTICATED users only
-- Drop any potentially redundant policies first
drop policy if exists "Allow authenticated actions" on public.inventory;
drop policy if exists "Allow authenticated select" on public.inventory;
drop policy if exists "Allow authenticated insert" on public.inventory;
drop policy if exists "Allow authenticated update" on public.inventory;
drop policy if exists "Allow authenticated delete" on public.inventory;

create policy "Allow authenticated actions" on public.inventory 
  for all 
  to authenticated 
  using (true) 
  with check (true);

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
  updated_at timestamp with time zone default now()
);

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

create policy "Users can manage own settings" on public.user_settings
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

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
