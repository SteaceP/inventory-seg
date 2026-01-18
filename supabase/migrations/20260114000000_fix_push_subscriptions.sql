-- ==========================================
-- FIX PUSH SUBSCRIPTIONS UNIQUE CONSTRAINT
-- ==========================================

-- Add endpoint column to store the unique subscription endpoint
alter table public.push_subscriptions 
  add column if not exists endpoint text;

-- Backfill endpoint from existing subscriptions
update public.push_subscriptions
  set endpoint = subscription->>'endpoint'
  where endpoint is null;

-- Make endpoint not null after backfill
alter table public.push_subscriptions 
  alter column endpoint set not null;

-- Drop old unique constraint on (user_id, subscription)
alter table public.push_subscriptions 
  drop constraint if exists push_subscriptions_user_id_subscription_key;

-- Create new unique constraint on (user_id, endpoint)
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'push_subscriptions_user_id_endpoint_key'
  ) then
    alter table public.push_subscriptions 
      add constraint push_subscriptions_user_id_endpoint_key 
      unique (user_id, endpoint);
  end if;
end $$;

-- Create index on endpoint for faster lookups
create index if not exists idx_push_subscriptions_endpoint 
  on public.push_subscriptions(endpoint);
