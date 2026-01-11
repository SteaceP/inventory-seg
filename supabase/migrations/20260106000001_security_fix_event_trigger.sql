-- Fix for "Function public.event_trigger_fn has a role mutable search_path"
-- This follows security best practices by fixing the search_path to be empty.
-- This prevents search_path hijacking and ensures all references within the function 
-- are resolved explicitly (e.g., public.my_table) or via the pg_catalog.

ALTER FUNCTION public.event_trigger_fn SET search_path = '';
