-- Seed data for inventory system

-- 1. Categories
INSERT INTO public.inventory_categories (name, low_stock_threshold)
VALUES
    ('Entretien', 10),
    ('Papeterie', 20),
    ('Infirmerie', 15),
    ('Cuisine', 5),
    ('Électronique', 2)
ON CONFLICT (name) DO NOTHING;

-- 2. Locations (Hierarchical)
-- We need to handle IDs for hierarchy, so we'll use a DO block
DO $$
DECLARE
    warehouse_id uuid;
    shelf_a_id uuid;
    shelf_b_id uuid;
BEGIN
    -- Main Warehouse
    INSERT INTO public.inventory_locations (name, description)
    VALUES ('Entrepôt Principal', 'Zone de stockage principale')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO warehouse_id;

    -- If it already existed and we didn't get an ID (because of ON CONFLICT DO NOTHING), fetch it
    IF warehouse_id IS NULL THEN
        SELECT id INTO warehouse_id FROM public.inventory_locations WHERE name = 'Entrepôt Principal';
    END IF;

    -- Shelves (Children of Warehouse)
    INSERT INTO public.inventory_locations (name, parent_id, description)
    VALUES ('Étagère A', warehouse_id, 'Produits d''entretien')
    ON CONFLICT (name) DO UPDATE SET parent_id = EXCLUDED.parent_id
    RETURNING id INTO shelf_a_id;

    IF shelf_a_id IS NULL THEN
        SELECT id INTO shelf_a_id FROM public.inventory_locations WHERE name = 'Étagère A';
    END IF;

    INSERT INTO public.inventory_locations (name, parent_id, description)
    VALUES ('Étagère B', warehouse_id, 'Fournitures de bureau')
    ON CONFLICT (name) DO UPDATE SET parent_id = EXCLUDED.parent_id
    RETURNING id INTO shelf_b_id;

     IF shelf_b_id IS NULL THEN
        SELECT id INTO shelf_b_id FROM public.inventory_locations WHERE name = 'Étagère B';
    END IF;

    -- Bins (Children of Shelves)
    INSERT INTO public.inventory_locations (name, parent_id, description)
    VALUES 
        ('Bac A1', shelf_a_id, 'Nettoyants liquides'),
        ('Bac A2', shelf_a_id, 'Brosses et éponges'),
        ('Bac B1', shelf_b_id, 'Stylos et crayons'),
        ('Bac B2', shelf_b_id, 'Papier imprimante')
    ON CONFLICT (name) DO NOTHING;

END $$;

-- 3. Inventory Items
-- We can insert these directly. Using explicit UUIDs or letting them generate is fine. 
-- Since we need to link stock locations, we might want to capture IDs.

DO $$
DECLARE
    item_bleach_id uuid;
    item_paper_id uuid;
    item_pen_id uuid;
    item_bandages_id uuid;
BEGIN
    -- Item 1: Bleach (Entretien)
    SELECT id INTO item_bleach_id FROM public.inventory WHERE sku = 'ENT-JAV-001';
    IF item_bleach_id IS NULL THEN
        INSERT INTO public.inventory (name, category, sku, low_stock_threshold, unit_cost, notes)
        VALUES ('Eau de Javel', 'Entretien', 'ENT-JAV-001', 5, 4.50, 'Bouteille de 4L')
        RETURNING id INTO item_bleach_id;
    ELSE
        UPDATE public.inventory SET unit_cost = 4.50 WHERE id = item_bleach_id;
    END IF;

    -- Item 2: Printer Paper (Papeterie)
    SELECT id INTO item_paper_id FROM public.inventory WHERE sku = 'PAP-A4-500';
    IF item_paper_id IS NULL THEN
        INSERT INTO public.inventory (name, category, sku, low_stock_threshold, unit_cost, notes)
        VALUES ('Papier Imprimante A4', 'Papeterie', 'PAP-A4-500', 10, 8.99, 'Rame de 500 feuilles')
        RETURNING id INTO item_paper_id;
    ELSE
        UPDATE public.inventory SET unit_cost = 8.99 WHERE id = item_paper_id;
    END IF;

     -- Item 3: Blue Pens (Papeterie)
    SELECT id INTO item_pen_id FROM public.inventory WHERE sku = 'PAP-STY-BLU';
    IF item_pen_id IS NULL THEN
        INSERT INTO public.inventory (name, category, sku, low_stock_threshold, unit_cost, notes)
        VALUES ('Stylos Billes Bleus', 'Papeterie', 'PAP-STY-BLU', 20, 0.50, 'Boîte de 50')
        RETURNING id INTO item_pen_id;
    ELSE
        UPDATE public.inventory SET unit_cost = 0.50 WHERE id = item_pen_id;
    END IF;

     -- Item 4: Bandages (Infirmerie)
    SELECT id INTO item_bandages_id FROM public.inventory WHERE sku = 'INF-PAN-100';
    IF item_bandages_id IS NULL THEN
        INSERT INTO public.inventory (name, category, sku, low_stock_threshold, unit_cost, notes)
        VALUES ('Pansements Adhésifs', 'Infirmerie', 'INF-PAN-100', 5, 6.25, 'Boîte variée')
        RETURNING id INTO item_bandages_id;
    ELSE
        UPDATE public.inventory SET unit_cost = 6.25 WHERE id = item_bandages_id;
    END IF;

    -- 4. Stock Locations (Linking items to physical spots)
    -- Linking Bleach to 'Bac A1' (Nettoyants)
    IF NOT EXISTS (SELECT 1 FROM public.inventory_stock_locations WHERE inventory_id = item_bleach_id AND location = 'Bac A1') THEN
         INSERT INTO public.inventory_stock_locations (inventory_id, location, quantity)
         VALUES (item_bleach_id, 'Bac A1', 12);
    END IF;

    -- Linking Paper to 'Bac B2' (Papier)
    IF NOT EXISTS (SELECT 1 FROM public.inventory_stock_locations WHERE inventory_id = item_paper_id AND location = 'Bac B2') THEN
        INSERT INTO public.inventory_stock_locations (inventory_id, location, quantity)
        VALUES (item_paper_id, 'Bac B2', 25);
    END IF;

    -- Linking Pens to 'Bac B1' (Stylos)
    IF NOT EXISTS (SELECT 1 FROM public.inventory_stock_locations WHERE inventory_id = item_pen_id AND location = 'Bac B1') THEN
        INSERT INTO public.inventory_stock_locations (inventory_id, location, quantity)
        VALUES (item_pen_id, 'Bac B1', 5); -- Low stock scenario (Threshold is 20)
    END IF;

     -- Linking Bandages to 'Entrepôt Principal' (General overflow)
    IF NOT EXISTS (SELECT 1 FROM public.inventory_stock_locations WHERE inventory_id = item_bandages_id AND location = 'Entrepôt Principal') THEN
        INSERT INTO public.inventory_stock_locations (inventory_id, location, quantity)
        VALUES (item_bandages_id, 'Entrepôt Principal', 50);
    END IF;

END $$;
