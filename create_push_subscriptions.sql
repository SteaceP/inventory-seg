-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, subscription)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own subscriptions"
ON public.push_subscriptions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add notifications and email_alerts to user_settings if they don't exist
-- (Assuming they might already be there based on previous context, but ensuring)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='notifications') THEN
        ALTER TABLE public.user_settings ADD COLUMN notifications BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='email_alerts') THEN
        ALTER TABLE public.user_settings ADD COLUMN email_alerts BOOLEAN DEFAULT true;
    END IF;
END $$;
