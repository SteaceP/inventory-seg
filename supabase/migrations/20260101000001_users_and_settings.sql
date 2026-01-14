-- ==========================================
-- USER SETTINGS & PROFILES
-- ==========================================

create table public.user_settings (
  user_id uuid references auth.users on delete cascade primary key,
  display_name text,
  notifications boolean default true,
  email_alerts boolean default true,
  low_stock_threshold integer default 5,
  dark_mode boolean default true,
  compact_view boolean default false,
  language varchar(2) default 'fr',
  avatar_url text,
  role text default 'admin' check (role in ('admin', 'user')),
  updated_at timestamp with time zone default now()
);

alter table public.user_settings enable row level security;

create policy "Users can modify own settings" on public.user_settings
  for insert to authenticated with check (user_id = auth.uid());

create policy "Users can update own settings" on public.user_settings
  for update to authenticated using (user_id = auth.uid());

create policy "Users can delete own settings" on public.user_settings
  for delete to authenticated using (user_id = auth.uid());

create policy "Authenticated can view all profiles" on public.user_settings
  for select to authenticated using (true);

create trigger update_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.update_updated_at_column();

-- ==========================================
-- PUSH NOTIFICATIONS
-- ==========================================

create table public.push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subscription jsonb not null,
    device_info text,
    created_at timestamptz default now(),
    unique(user_id, subscription)
);

alter table public.push_subscriptions enable row level security;

create policy "Users can manage their own subscriptions"
  on public.push_subscriptions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add to Realtime
alter publication supabase_realtime add table public.user_settings;
