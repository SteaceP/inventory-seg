-- Migration: Add unique constraint to inventory_stock_locations
-- Description: Adds a unique constraint on (inventory_id, location) to support ON CONFLICT upsert operations.

-- IMPORTANT: Before applying this migration, check for duplicate entries.
-- The following query will help you find any inventory items that have multiple stock records for the same location.
-- You must resolve these duplicates (e.g., by merging quantities and deleting rows) before the constraint can be added.
--
-- Run this in your Supabase SQL Editor:
/*
SELECT inventory_id, location, COUNT(*)
FROM public.inventory_stock_locations
GROUP BY inventory_id, location
HAVING COUNT(*) > 1;
*/

-- Add the unique constraint. This is the standard and most reliable way to enforce uniqueness.
-- This command will fail if any duplicates are found, so please run the check above first.
ALTER TABLE public.inventory_stock_locations
ADD CONSTRAINT inventory_stock_locations_inventory_id_location_key UNIQUE (inventory_id, location);

-- Clean up the old index if it exists. The unique constraint creates its own index.
DROP INDEX IF EXISTS public.idx_inventory_stock_locations_unique;
