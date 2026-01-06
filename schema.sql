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
drop policy if exists "Allow all actions" on public.inventory;
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
