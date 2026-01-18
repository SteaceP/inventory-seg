-- ==========================================
-- DROP LEGACY REALTIME PUBLICATION
-- ==========================================
-- The application has fully migrated to the 'Broadcast' method.
-- Dropping the 'supabase_realtime' publication eliminates internal 
-- metadata polling overhead from the Supabase Realtime engine.

drop publication if exists supabase_realtime;
