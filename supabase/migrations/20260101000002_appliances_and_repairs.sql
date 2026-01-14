-- ==========================================
-- APPLIANCES & REPAIRS
-- ==========================================

-- 1. Appliances Table
create table public.appliances (
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

create policy "Users can manage own appliances" on public.appliances
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger update_appliances_updated_at
  before update on public.appliances
  for each row execute function public.update_updated_at_column();

-- 2. Repairs Table
create table public.repairs (
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
      where id = appliance_id
      and user_id = auth.uid()
    )
  );

-- Add to Realtime
alter publication supabase_realtime add table public.appliances;
alter publication supabase_realtime add table public.repairs;
