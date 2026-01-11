-- Add new columns to appliances table
ALTER TABLE public.appliances ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.appliances ADD COLUMN IF NOT EXISTS sku text;

-- Create storage bucket for appliance images
insert into storage.buckets (id, name, public) 
values ('appliance-images', 'appliance-images', true)
on conflict (id) do nothing;

-- Allow public viewing of appliance images
create policy "Public appliance image viewing" on storage.objects 
  for select using ( bucket_id = 'appliance-images' );

-- Allow authenticated users to manage appliance images
create policy "Authenticated appliance image management" on storage.objects 
  for all 
  to authenticated 
  using ( bucket_id = 'appliance-images' )
  with check ( bucket_id = 'appliance-images' );
