/*
  # Add Rate Limiting for Contact Forms

  This migration adds rate limiting to prevent spam submissions
  and protect against abuse.
*/

-- Create a function to check rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  table_name text,
  identifier text,
  time_window interval DEFAULT '1 hour',
  max_attempts integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add rate limiting check to contact submissions
CREATE OR REPLACE FUNCTION check_contact_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check rate limit by email address
  IF NOT check_rate_limit('contact_submissions', 'email', '1 hour'::interval, 3) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting another message.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for contact submissions
DROP TRIGGER IF EXISTS contact_rate_limit_trigger ON contact_submissions;
CREATE TRIGGER contact_rate_limit_trigger
  BEFORE INSERT ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_contact_rate_limit();

-- Add rate limiting check to quote requests
CREATE OR REPLACE FUNCTION check_quote_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check rate limit by email address
  IF NOT check_rate_limit('quote_requests', 'email', '1 hour'::interval, 2) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting another quote request.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for quote requests
DROP TRIGGER IF EXISTS quote_rate_limit_trigger ON quote_requests;
CREATE TRIGGER quote_rate_limit_trigger
  BEFORE INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION check_quote_rate_limit(); 