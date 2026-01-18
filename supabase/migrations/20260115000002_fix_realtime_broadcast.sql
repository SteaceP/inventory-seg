-- Migration to fix missing realtime.broadcast_changes function
-- This function is used by public.handle_broadcast_activity() to send real-time notifications

do $$
begin
  -- Ensure the realtime schema exists (it should in Supabase, but for local envs)
  if not exists (select 1 from pg_namespace where nspname = 'realtime') then
    create schema realtime;
  end if;
end $$;

-- Create the helper function for broadcasting changes
-- This function inserts into the realtime.messages table which Supabase listens to
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
    -- Fail gracefully if realtime.messages doesn't exist or other issues
    -- This prevents the main transaction from failing if broadcast fails
    null;
end;
$$;

-- Ensure the realtime.messages table exists if we're in an environment that needs it
-- Usually Supabase provides this, but we can ensure it exists for the trigger to work
do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'realtime' and table_name = 'messages') then
    create table realtime.messages (
      id bigint generated always as identity primary key,
      topic text not null,
      event text not null,
      payload jsonb,
      created_at timestamp with time zone default now()
    );
    -- Enable RLS on it
    alter table realtime.messages enable row level security;
  end if;
end $$;
