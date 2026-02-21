-- Migration to support user-selectable navigation styles
-- 1. Add navigation_type column if it doesn't exist
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS navigation_type text DEFAULT 'bottom' CHECK (navigation_type IN ('sidebar', 'bottom'));

-- 2. Change default role from 'admin' to 'user' for new users
ALTER TABLE public.user_settings ALTER COLUMN role SET DEFAULT 'user';

-- 3. Update existing admins to use 'sidebar' as their default navigation
UPDATE public.user_settings SET navigation_type = 'sidebar' WHERE role = 'admin';
