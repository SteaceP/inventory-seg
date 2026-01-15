-- Create master table for inventory locations
create table if not exists public.inventory_locations (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  parent_id uuid references public.inventory_locations(id) on delete cascade,
  description text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.inventory_locations enable row level security;

-- Policies
create policy "Anyone authenticated can view locations" 
  on public.inventory_locations for select to authenticated using (true);

create policy "Admins can manage locations" 
  on public.inventory_locations for all to authenticated 
  using (exists (select 1 from public.user_settings where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_settings where user_id = auth.uid() and role = 'admin'));

-- Populate with existing locations from stock table
insert into public.inventory_locations (name)
select distinct location from public.inventory_stock_locations
where location is not null and location <> ''
on conflict (name) do nothing;
