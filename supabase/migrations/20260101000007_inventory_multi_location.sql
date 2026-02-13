-- Support multiple locations for inventory stock

-- 1. Create inventory_stock_locations table
create table if not exists public.inventory_stock_locations (
  id uuid default gen_random_uuid() primary key,
  inventory_id uuid references public.inventory(id) on delete cascade not null,
  location text not null,
  quantity integer default 0,
  created_at timestamp with time zone default now()
);

-- Index for performance
create index if not exists idx_isl_inventory_id on public.inventory_stock_locations(inventory_id);

-- 2. Trigger function to update the main inventory.stock column
create or replace function public.sync_inventory_stock_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'DELETE') then
    update public.inventory
    set stock = (select coalesce(pg_catalog.sum(quantity), 0) from public.inventory_stock_locations where inventory_id = old.inventory_id)
    where id = old.inventory_id;
    return old;
  else
    update public.inventory
    set stock = (select coalesce(pg_catalog.sum(quantity), 0) from public.inventory_stock_locations where inventory_id = new.inventory_id)
    where id = new.inventory_id;
    return new;
  end if;
end;
$$;

-- 3. Attach the trigger
drop trigger if exists trigger_sync_inventory_stock on public.inventory_stock_locations;
create trigger trigger_sync_inventory_stock
after insert or update or delete on public.inventory_stock_locations
for each row execute function public.sync_inventory_stock_total();

-- 4. Enable RLS on the new table
alter table public.inventory_stock_locations enable row level security;

drop policy if exists "Users can view stock locations" on public.inventory_stock_locations;
create policy "Users can view stock locations"
  on public.inventory_stock_locations for select to authenticated using (true);

drop policy if exists "Admins can manage stock locations" on public.inventory_stock_locations;
create policy "Admins can insert stock locations"
  on public.inventory_stock_locations for insert to authenticated
  with check (exists (select 1 from public.user_settings where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can update stock locations"
  on public.inventory_stock_locations for update to authenticated
  using (exists (select 1 from public.user_settings where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can delete stock locations"
  on public.inventory_stock_locations for delete to authenticated
  using (exists (select 1 from public.user_settings where user_id = (select auth.uid()) and role = 'admin'));

-- 5. Migrate existing data
-- If an inventory item has a location and stock, create an initial entry in the new table
insert into public.inventory_stock_locations (inventory_id, location, quantity)
select id, location, stock from public.inventory
where location is not null and location <> '' and stock > 0
on conflict do nothing;

-- 6. Clean up: We can keep the location column in inventory for the appliance case or leave it as a "legacy/default"
-- but the user said "only for the inventory since the appliances are not needed of that".
-- We'll keep the column but use the child table for inventory logic.
