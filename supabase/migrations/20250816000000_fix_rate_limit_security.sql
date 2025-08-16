-- Fix Rate Limiting Function Security Issues
-- Migration: 20250816000000_fix_rate_limit_security

-- Drop existing triggers first
DROP TRIGGER IF EXISTS contact_rate_limit_trigger ON contact_submissions;
DROP TRIGGER IF EXISTS quote_rate_limit_trigger ON quote_requests;

-- Drop existing functions
DROP FUNCTION IF EXISTS check_contact_rate_limit();
DROP FUNCTION IF EXISTS check_quote_rate_limit();
DROP FUNCTION IF EXISTS check_rate_limit(text, text, interval, integer);

-- Recreate the main rate limiting function with FIXED search path
CREATE OR REPLACE FUNCTION check_rate_limit(
  table_name text,
  identifier text,
  time_window interval DEFAULT '1 hour',
  max_attempts integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count recent attempts
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE %I = $1 AND created_at > NOW() - $2',
    table_name, identifier
  ) INTO attempt_count USING identifier, time_window;
  
  -- Return true if under limit, false if over limit
  RETURN attempt_count < max_attempts;
END;
$$;

-- Recreate contact rate limit function with FIXED search path
CREATE OR REPLACE FUNCTION check_contact_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check rate limit by email address
  IF NOT check_rate_limit('contact_submissions', 'email', '1 hour'::interval, 3) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting another message.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate quote rate limit function with FIXED search path
CREATE OR REPLACE FUNCTION check_quote_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check rate limit by email address
  IF NOT check_rate_limit('quote_requests', 'email', '1 hour'::interval, 2) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting another quote request.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER contact_rate_limit_trigger
  BEFORE INSERT ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_contact_rate_limit();

CREATE TRIGGER quote_rate_limit_trigger
  BEFORE INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION check_quote_rate_limit();

-- Add security comments
COMMENT ON FUNCTION check_rate_limit(text, text, interval, integer) IS 'Rate limiting function with fixed search path for security';
COMMENT ON FUNCTION check_contact_rate_limit() IS 'Contact form rate limiting with fixed search path for security';
COMMENT ON FUNCTION check_quote_rate_limit() IS 'Quote request rate limiting with fixed search path for security';
