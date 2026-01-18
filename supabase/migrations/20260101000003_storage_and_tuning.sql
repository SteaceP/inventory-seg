-- ==========================================
-- STORAGE BUCKETS & POLICIES
-- ==========================================

-- 1. Create Buckets
insert into storage.buckets (id, name, public) values 
  ('inventory-images', 'inventory-images', true),
  ('avatars', 'avatars', true),
  ('appliance-images', 'appliance-images', true)
on conflict (id) do nothing;

-- 2. Storage Policies
-- Primary viewing access
drop policy if exists "Public image viewing" on storage.objects;
create policy "Public image viewing" on storage.objects for select 
   using ( bucket_id in ('inventory-images', 'avatars', 'appliance-images') );

-- Restricted management access
drop policy if exists "Authenticated image management" on storage.objects;
create policy "Authenticated image management" on storage.objects for all 
  to authenticated 
  using ( bucket_id in ('inventory-images', 'avatars', 'appliance-images') )
  with check ( bucket_id in ('inventory-images', 'avatars', 'appliance-images') );


-- ==========================================
-- PERFORMANCE TUNING
-- ==========================================

-- 1. Replica Identity for Realtime
-- This ensures only necessary columns are logged for WAL
do $$ 
declare 
    tbl record;
begin 
    for tbl in (select tablename from pg_tables where schemaname = 'public') 
    loop 
        execute format('alter table public.%I replica identity default', tbl.tablename);
    end loop;
end $$;

-- 2. Role Settings (Optimization)
do $$ 
declare 
    r text;
begin 
    for r in (select role_name from (values ('postgres'), ('authenticator'), ('authenticated'), ('anon')) as t(role_name)) 
    loop
        execute format('alter role %I set timezone to ''UTC''', r);
        execute format('alter role %I set jit = off', r);
    end loop;
end $$;

-- 3. Pre-analyze tables
analyze public.inventory;
analyze public.user_settings;
analyze public.appliances;
analyze public.repairs;
analyze public.inventory_activity;
analyze public.push_subscriptions;
analyze public.inventory_categories;
