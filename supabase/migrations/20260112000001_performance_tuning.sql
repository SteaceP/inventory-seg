-- Migration: Supabase Performance Tuning (Comprehensive)
-- Target: Optimize Realtime performance and catalog discovery speed

-- 1. Apply REPLICA IDENTITY DEFAULT to ALL public tables
-- This is the #1 fix for slow realtime.list_changes
DO $$ 
DECLARE 
    tbl RECORD;
BEGIN 
    FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY DEFAULT', tbl.tablename);
    END LOOP;
END $$;

-- 2. Performance-oriented Role Settings
-- Disabling JIT and setting UTC timezone prevents discovery probes and plan overhead
DO $$ 
DECLARE 
    r TEXT;
BEGIN 
    FOR r IN (SELECT role_name FROM (VALUES ('postgres'), ('authenticator'), ('authenticated'), ('anon')) AS t(role_name)) 
    LOOP
        EXECUTE format('ALTER ROLE %I SET timezone TO ''UTC''', r);
        EXECUTE format('ALTER ROLE %I SET jit = off', r);
        -- Disable statement timeout for these roles to prevent dashboard disconnects (optional, but safe)
        -- EXECUTE format('ALTER ROLE %I SET statement_timeout = 0', r);
    END LOOP;
END $$;

-- 3. Analyze all tables to refresh statistics
ANALYZE public.inventory;
ANALYZE public.user_settings;
ANALYZE public.appliances;
ANALYZE public.repairs;
ANALYZE public.inventory_activity;
ANALYZE public.push_subscriptions;
