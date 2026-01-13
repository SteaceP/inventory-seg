-- Add low_stock_threshold to inventory table
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS low_stock_threshold integer;

-- Create inventory_categories table for category-level thresholds
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  name text PRIMARY KEY,
  low_stock_threshold integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for inventory_categories
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view category thresholds
DROP POLICY IF EXISTS "Anyone authenticated can view category thresholds" ON public.inventory_categories;
CREATE POLICY "Anyone authenticated can view category thresholds" 
ON public.inventory_categories FOR SELECT 
TO authenticated 
USING (true);

-- Allow admins full access to category thresholds
DROP POLICY IF EXISTS "Admins can manage category thresholds" ON public.inventory_categories;
CREATE POLICY "Admins can manage category thresholds" 
ON public.inventory_categories FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_settings
    WHERE user_id = (select auth.uid()) AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_settings
    WHERE user_id = (select auth.uid()) AND role = 'admin'
  )
);

-- Trigger for updated_at on inventory_categories
DROP TRIGGER IF EXISTS update_inventory_categories_updated_at ON public.inventory_categories;
CREATE TRIGGER update_inventory_categories_updated_at
  BEFORE UPDATE ON public.inventory_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add to Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_categories;
