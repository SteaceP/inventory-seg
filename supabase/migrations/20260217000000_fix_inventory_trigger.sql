CREATE OR REPLACE FUNCTION public.sync_inventory_stock_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if (tg_op = 'DELETE') then
    update public.inventory
    set stock = (select coalesce(pg_catalog.sum(quantity), 0::bigint) from public.inventory_stock_locations where inventory_id = old.inventory_id)
    where id = old.inventory_id;
    return old;
  else
    update public.inventory
    set stock = (select coalesce(pg_catalog.sum(quantity), 0::bigint) from public.inventory_stock_locations where inventory_id = new.inventory_id)
    where id = new.inventory_id;
    return new;
  end if;
end;
$function$
;
