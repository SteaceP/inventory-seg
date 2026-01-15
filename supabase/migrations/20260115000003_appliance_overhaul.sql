-- Add status and expected_life to appliances
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appliance_status') THEN
        CREATE TYPE public.appliance_status AS ENUM ('functional', 'needs_service', 'broken');
    END IF;
END $$;

ALTER TABLE public.appliances 
ADD COLUMN IF NOT EXISTS status public.appliance_status DEFAULT 'functional',
ADD COLUMN IF NOT EXISTS expected_life integer DEFAULT 10;

-- Backfill existing records if any
UPDATE public.appliances SET status = 'functional' WHERE status IS NULL;
UPDATE public.appliances SET expected_life = 10 WHERE expected_life IS NULL;
