create extension if not exists "hypopg" with schema "extensions";

create extension if not exists "index_advisor" with schema "extensions";

drop extension if exists "pg_net";

drop policy "Admins can delete category thresholds" on "public"."inventory_categories";

drop policy "Admins can insert category thresholds" on "public"."inventory_categories";

drop policy "Admins can update category thresholds" on "public"."inventory_categories";

drop policy "Admins can delete locations" on "public"."inventory_locations";

drop policy "Admins can insert locations" on "public"."inventory_locations";

drop policy "Admins can update locations" on "public"."inventory_locations";

drop policy "Admins can delete stock locations" on "public"."inventory_stock_locations";

drop policy "Admins can insert stock locations" on "public"."inventory_stock_locations";

drop policy "Admins can update stock locations" on "public"."inventory_stock_locations";

alter table "public"."inventory" drop constraint "inventory_sku_key";

alter table "public"."user_settings" drop constraint "user_settings_pkey";

drop index if exists "public"."inventory_sku_key";

drop index if exists "public"."user_settings_pkey";

alter table "public"."inventory" alter column "sku" set default 'unique'::text;

alter table "public"."user_settings" add column "created_at" timestamp with time zone default now();

alter table "public"."user_settings" add column "id" uuid not null default gen_random_uuid();

alter table "public"."user_settings" alter column "email_alerts" set default false;

CREATE INDEX idx_appliances_user_id ON public.appliances USING btree (user_id);

CREATE INDEX idx_inventory_activity_inventory_id ON public.inventory_activity USING btree (inventory_id);

CREATE INDEX idx_inventory_activity_user_id ON public.inventory_activity USING btree (user_id);

CREATE INDEX idx_repairs_appliance_id ON public.repairs USING btree (appliance_id);

CREATE INDEX inventory_category_idx ON public.inventory USING btree (category);

CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id);

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (id);

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."user_settings" add constraint "user_settings_user_id_key" UNIQUE using index "user_settings_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.event_trigger_fn()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Add logic here
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_broadcast_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  payload_record jsonb;
  payload_old_record jsonb;
begin
  if TG_OP = 'DELETE' then
    payload_record := null;
    payload_old_record := pg_catalog.to_jsonb(OLD);
  else
    payload_record := pg_catalog.to_jsonb(NEW);
    payload_old_record := case when TG_OP = 'UPDATE' then pg_catalog.to_jsonb(OLD) else null end;
  end if;

  perform realtime.broadcast_changes(
    'app-activity',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    payload_record,
    payload_old_record
  );
  
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_inventory_stock_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if (tg_op = 'DELETE') then
    update public.inventory
    set stock = (select pg_catalog.coalesce(pg_catalog.sum(quantity), 0) from public.inventory_stock_locations where inventory_id = old.inventory_id)
    where id = old.inventory_id;
    return old;
  else
    update public.inventory
    set stock = (select pg_catalog.coalesce(pg_catalog.sum(quantity), 0) from public.inventory_stock_locations where inventory_id = new.inventory_id)
    where id = new.inventory_id;
    return new;
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$function$
;


  create policy "Admins can manage category thresholds"
  on "public"."inventory_categories"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.user_settings
  WHERE ((user_settings.user_id = ( SELECT auth.uid() AS uid)) AND (user_settings.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.user_settings
  WHERE ((user_settings.user_id = ( SELECT auth.uid() AS uid)) AND (user_settings.role = 'admin'::text)))));



  create policy "Admins can manage locations"
  on "public"."inventory_locations"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.user_settings
  WHERE ((user_settings.user_id = ( SELECT auth.uid() AS uid)) AND (user_settings.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.user_settings
  WHERE ((user_settings.user_id = ( SELECT auth.uid() AS uid)) AND (user_settings.role = 'admin'::text)))));



  create policy "Admins can manage stock locations"
  on "public"."inventory_stock_locations"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.user_settings
  WHERE ((user_settings.user_id = ( SELECT auth.uid() AS uid)) AND (user_settings.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.user_settings
  WHERE ((user_settings.user_id = ( SELECT auth.uid() AS uid)) AND (user_settings.role = 'admin'::text)))));



  create policy "All Access"
  on "storage"."objects"
  as permissive
  for all
  to public
using ((bucket_id = 'inventory-images'::text));



  create policy "Authenticated appliance image management"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using ((bucket_id = 'appliance-images'::text))
with check ((bucket_id = 'appliance-images'::text));



  create policy "Avatar management"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using ((bucket_id = 'avatars'::text));



  create policy "Avatar viewing"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Public Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'inventory-images'::text));



  create policy "Public appliance image viewing"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'appliance-images'::text));



