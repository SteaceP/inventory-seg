-- Create table for tracking failed verification attempts
CREATE TABLE IF NOT EXISTS public.password_failed_verification_attempts (
  user_id UUID PRIMARY KEY,
  last_failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the Auth Hook function
CREATE OR REPLACE FUNCTION public.hook_password_verification_attempt(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
  DECLARE
    last_failed_at_val timestamp with time zone;
  BEGIN
    -- If password is valid, allow it
    IF event->'valid' IS TRUE THEN
      RETURN jsonb_build_object('decision', 'continue');
    END IF;

    -- Look up the last failed attempt for this user
    SELECT last_failed_at INTO last_failed_at_val
      FROM public.password_failed_verification_attempts
      WHERE user_id = (event->'user_id')::uuid;

    -- Check if it was within the last 10 seconds
    IF last_failed_at_val IS NOT NULL AND now() - last_failed_at_val < interval '10 seconds' THEN
      RETURN jsonb_build_object(
        'error', jsonb_build_object(
          'http_code', 429,
          'message', 'Please wait a moment before trying again.'
        )
      );
    END IF;

    -- Record the failed attempt
    INSERT INTO public.password_failed_verification_attempts (user_id, last_failed_at)
      VALUES ((event->'user_id')::uuid, now())
      ON CONFLICT (user_id) DO UPDATE
        SET last_failed_at = now();

    -- Continue with default Supabase Auth behavior
    RETURN jsonb_build_object('decision', 'continue');
  END;
$$;

-- Assign appropriate permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

GRANT EXECUTE
  ON FUNCTION public.hook_password_verification_attempt
  TO supabase_auth_admin;

GRANT ALL
  ON TABLE public.password_failed_verification_attempts
  TO supabase_auth_admin;

REVOKE EXECUTE
  ON FUNCTION public.hook_password_verification_attempt
  FROM authenticated, anon, public;

REVOKE ALL
  ON TABLE public.password_failed_verification_attempts
  FROM authenticated, anon, public;
