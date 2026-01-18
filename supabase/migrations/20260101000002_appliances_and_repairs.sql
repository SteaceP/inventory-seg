-- ==========================================
-- APPLIANCES & REPAIRS
-- ==========================================

-- 1. Appliances Table
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

alter table public.appliances enable row level security;

drop policy if exists "Users can manage own appliances" on public.appliances;
create policy "Users can manage own appliances" on public.appliances
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop trigger if exists update_appliances_updated_at on public.appliances;
create trigger update_appliances_updated_at
  before update on public.appliances
  for each row execute function public.update_updated_at_column();

-- 2. Repairs Table
create table if not exists public.repairs (
  id uuid default gen_random_uuid() primary key,
  appliance_id uuid references public.appliances(id) on delete cascade not null,
  repair_date date default current_date,
  description text not null,
  cost numeric(10, 2),
  parts jsonb default '[]'::jsonb,
  service_provider text,
  created_at timestamp with time zone default now()
);

alter table public.repairs enable row level security;

drop policy if exists "Users can manage own repairs" on public.repairs;
create policy "Users can manage own repairs" on public.repairs
  for all to authenticated
  using (
    exists (
      select 1 from public.appliances
      where id = repairs.appliance_id
      and user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.appliances
      where id = appliance_id
      and user_id = (select auth.uid())
    )
  );

-- End of appliances and repairs
