-- Add social media fields to business_settings table
-- Migration: 20250815000000_add_social_media_fields

-- Add Facebook and Instagram URL columns
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN business_settings.facebook_url IS 'Facebook page URL for social media integration';
COMMENT ON COLUMN business_settings.instagram_url IS 'Instagram profile URL for social media integration';

-- Update existing records to have empty strings instead of NULL for consistency
UPDATE business_settings 
SET 
  facebook_url = COALESCE(facebook_url, ''),
  instagram_url = COALESCE(instagram_url, '')
WHERE facebook_url IS NULL OR instagram_url IS NULL;
