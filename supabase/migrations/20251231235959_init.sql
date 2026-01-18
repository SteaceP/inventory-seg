-- ==========================================
-- CORE SETUP & UTILITIES
-- ==========================================

-- Security fix for event_trigger_fn if it exists (Legacy/Supabase specific)
do $$ 
begin
  if exists (select 1 from pg_proc where proname = 'event_trigger_fn') then
    alter function public.event_trigger_fn set search_path = '';
  end if;
end $$;

-- Function to update the updated_at column
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

-- Refine Realtime Publication
drop publication if exists supabase_realtime;
create publication supabase_realtime;
