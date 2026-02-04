-- Migration: Add MFA Support to User Settings
-- Description: Adds a column to track whether a user has enabled MFA
-- Supabase manages the actual MFA factors in auth.mfa_factors table

-- Add mfa_enabled column to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN public.user_settings.mfa_enabled IS 'Whether the user has enabled multi-factor authentication';

-- Create index for faster queries filtering by MFA status
CREATE INDEX IF NOT EXISTS idx_user_settings_mfa_enabled 
ON public.user_settings(mfa_enabled) 
WHERE mfa_enabled = TRUE;
