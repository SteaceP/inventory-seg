-- ==========================================
-- SECURITY HARDENING: SET search_path
-- ==========================================
-- Hardening functions to prevent search_path hijacking.
-- This re-defines existing functions with 'SET search_path = '''.

-- 1. update_updated_at_column
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

-- 2. handle_broadcast_activity
create or replace function public.handle_broadcast_activity()
returns trigger
security definer
language plpgsql
set search_path = ''
as $$
declare
  payload_record jsonb;
  payload_old_record jsonb;
begin
  if TG_OP = 'DELETE' then
    payload_record := null;
    payload_old_record := pg_catalog.to_jsonb(OLD);
  else
    payload_record := pg_catalog.to_jsonb(NEW);
    payload_old_record := case when TG_OP = 'UPDATE' then pg_catalog.to_jsonb(OLD) else null end;
  end if;

  perform realtime.broadcast_changes(
    'app-activity',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    payload_record,
    payload_old_record
  );
  
  return null;
end;
$$;

-- 3. broadcast_changes
create or replace function realtime.broadcast_changes(
    topic text,
    event text,
    operation text,
    table_name text,
    table_schema text,
    new_record jsonb,
    old_record jsonb
)
returns void
security definer
language plpgsql
set search_path = ''
as $$
begin
  insert into realtime.messages (topic, event, payload)
  values (
    topic,
    event,
    pg_catalog.jsonb_build_object(
      'op', operation,
      'table', table_name,
      'schema', table_schema,
      'data', new_record,
      'old_data', old_record
    )
  );
exception
  when others then
    null;
end;
$$;

-- 4. sync_inventory_stock_total
create or replace function public.sync_inventory_stock_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'DELETE') then
    update public.inventory
    set stock = (select pg_catalog.coalesce(pg_catalog.sum(quantity), 0) from public.inventory_stock_locations where inventory_id = old.inventory_id)
    where id = old.inventory_id;
    return old;
  else
    update public.inventory
    set stock = (select pg_catalog.coalesce(pg_catalog.sum(quantity), 0) from public.inventory_stock_locations where inventory_id = new.inventory_id)
    where id = new.inventory_id;
    return new;
  end if;
end;
$$;
