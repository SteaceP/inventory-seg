-- Add support for sub-locations to inventory_stock_locations
-- Allow hierarchical location structure (e.g., "Warehouse A" -> "Shelf A-1", "Shelf A-2")

-- Add parent_location column to support hierarchical locations
alter table public.inventory_stock_locations
add column if not exists parent_location text;

-- Add index for efficient sub-location queries
create index if not exists idx_isl_parent_location 
on public.inventory_stock_locations(parent_location) 
where parent_location is not null;

-- Add comment for documentation
comment on column public.inventory_stock_locations.parent_location is 
'Optional parent location name for hierarchical location structure';
