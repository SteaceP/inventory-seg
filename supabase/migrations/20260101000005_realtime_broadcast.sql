-- 1. Enable Broadcast Authorization
-- Allow authenticated users to receive broadcast messages from the 'realtime' schema
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'realtime' 
    and tablename = 'messages' 
    and policyname = 'Authenticated users can receive broadcasts'
  ) then
    create policy "Authenticated users can receive broadcasts"
    on "realtime"."messages"
    for select
    to authenticated
    using ( true );
  end if;
end $$;

-- 2. Create a unified Trigger Function for activity broadcasting
create or replace function public.handle_broadcast_activity()
returns trigger
security definer
language plpgsql
as $$
declare
  payload_record jsonb;
  payload_old_record jsonb;
begin
  -- For delete, we only have OLD
  if TG_OP = 'DELETE' then
    payload_record := null;
    payload_old_record := to_jsonb(OLD);
  else
    payload_record := to_jsonb(NEW);
    payload_old_record := case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end;
  end if;

  perform realtime.broadcast_changes(
    'app-activity',           -- topic: general channel for site-wide notifications
    TG_OP,                    -- event: INSERT, UPDATE, or DELETE
    TG_OP,                    -- operation: same as event here
    TG_TABLE_NAME,            -- table name (e.g., 'inventory_activity', 'appliances')
    TG_TABLE_SCHEMA,          -- schema name (e.g., 'public')
    payload_record,           -- new record
    payload_old_record        -- old record
  );
  
  return null;
end;
$$;

-- 3. Attach triggers
-- We only care about NEW activities for inventory summary
drop trigger if exists broadcast_inventory_activity on public.inventory_activity;
create trigger broadcast_inventory_activity
after insert on public.inventory_activity
for each row execute function public.handle_broadcast_activity();

-- For appliances, we track more events
drop trigger if exists broadcast_appliance_activity on public.appliances;
create trigger broadcast_appliance_activity
after insert or update on public.appliances
for each row execute function public.handle_broadcast_activity();

-- 4. Clean up: Remove tables from the old publication to save resources
-- This disables the "postgres_changes" WAL-based method for these tables
do $$
begin
  if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'inventory_activity') then
    alter publication supabase_realtime drop table public.inventory_activity;
  end if;
  if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'appliances') then
    alter publication supabase_realtime drop table public.appliances;
  end if;
end $$;
