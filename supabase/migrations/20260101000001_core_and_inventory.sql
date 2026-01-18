-- ==========================================
-- INVENTORY SYSTEM
-- ==========================================

-- 1. Inventory Table
create table if not exists public.inventory (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  sku text unique,
  stock integer default 0,
  low_stock_threshold integer,
  image_url text,
  created_at timestamp with time zone default now()
);

alter table public.inventory enable row level security;

-- Policies for Inventory
drop policy if exists "User view access" on public.inventory;
create policy "User view access" on public.inventory
  for select to authenticated using (true);

drop policy if exists "Admin insert access" on public.inventory;
create policy "Admin insert access" on public.inventory
  for insert to authenticated
  with check (
    exists (
      select 1 from public.user_settings
      where user_id = (select auth.uid()) and role = 'admin'
    )
  );

drop policy if exists "Authenticated update access" on public.inventory;
create policy "Authenticated update access" on public.inventory
  for update to authenticated
  using (exists (select 1 from public.user_settings where user_id = (select auth.uid())))
  with check (exists (select 1 from public.user_settings where user_id = (select auth.uid())));

drop policy if exists "Admin delete access" on public.inventory;
create policy "Admin delete access" on public.inventory
  for delete to authenticated
  using (
    exists (
      select 1 from public.user_settings
      where user_id = (select auth.uid()) and role = 'admin'
    )
  );

-- 2. Inventory Categories (Thresholds)
create table if not exists public.inventory_categories (
  name text primary key,
  low_stock_threshold integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.inventory_categories enable row level security;

drop policy if exists "Anyone authenticated can view category thresholds" on public.inventory_categories;
create policy "Anyone authenticated can view category thresholds" 
  on public.inventory_categories for select to authenticated using (true);

drop policy if exists "Admins can manage category thresholds" on public.inventory_categories;
create policy "Admins can insert category thresholds" 
  on public.inventory_categories for insert to authenticated 
  with check (exists (select 1 from public.user_settings where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can update category thresholds" 
  on public.inventory_categories for update to authenticated 
  using (exists (select 1 from public.user_settings where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can delete category thresholds" 
  on public.inventory_categories for delete to authenticated 
  using (exists (select 1 from public.user_settings where user_id = (select auth.uid()) and role = 'admin'));

drop trigger if exists update_inventory_categories_updated_at on public.inventory_categories;
create trigger update_inventory_categories_updated_at
  before update on public.inventory_categories
  for each row execute function public.update_updated_at_column();

-- 3. Inventory Activity Tracking
create table if not exists public.inventory_activity (
  id uuid default gen_random_uuid() primary key,
  inventory_id uuid references public.inventory(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  item_name text not null,
  changes jsonb,
  created_at timestamp with time zone default now()
);

alter table public.inventory_activity enable row level security;

drop policy if exists "Allow authenticated to view activity" on public.inventory_activity;
create policy "Allow authenticated to view activity" 
  on public.inventory_activity for select to authenticated using (true);

drop policy if exists "Allow authenticated to insert activity" on public.inventory_activity;
create policy "Allow authenticated to insert activity" 
  on public.inventory_activity for insert to authenticated with check (true);

create index if not exists idx_inventory_activity_created_at on public.inventory_activity(created_at desc);

-- End of core and inventory
