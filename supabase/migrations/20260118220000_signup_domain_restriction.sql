-- Migration to restrict signups to the s-e-g.ca domain

-- Function to check email domain
CREATE OR REPLACE FUNCTION public.check_email_domain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email NOT LIKE '%@s-e-g.ca' THEN
    RAISE EXCEPTION 'Registration is restricted to s-e-g.ca domain.';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to enforce domain restriction on auth.users (before insert)
DROP TRIGGER IF EXISTS tr_restrict_signup_domain ON auth.users;
CREATE TRIGGER tr_restrict_signup_domain
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.check_email_domain();
