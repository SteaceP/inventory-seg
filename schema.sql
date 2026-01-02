-- Create the inventory table
create table public.inventory (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  sku text unique,
  stock integer default 0,
  price numeric(10, 2) default 0.00,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.inventory enable row level security;

-- Create policy to allow all actions (Select, Insert, Update, Delete)
-- NOTE: For production, you should restrict this to authenticated users or specific roles.
create policy "Allow all actions" on public.inventory for all using (true);
