-- ==========================================
-- HARDEN RLS FOR INVENTORY ACTIVITY
-- ==========================================
-- Restrict INSERT so users can only log activity under their own user_id.

drop policy if exists "Allow authenticated to insert activity" on public.inventory_activity;

create policy "Allow authenticated to insert activity" 
  on public.inventory_activity for insert to authenticated 
  with check (user_id = (select auth.uid()));
