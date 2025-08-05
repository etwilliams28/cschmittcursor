/*
  # Add Sheds Page Features

  1. New Tables
    - Add sheds_hero content section to home_content
    - Add inspiration_images and custom_message to quote_requests
    - Add standard_features and optional_upgrades to shed_listings specifications

  2. Updates
    - Extend quote_requests table with new fields
    - Update shed_listings specifications structure
    - Add sheds hero content section

  3. Security
    - Maintain existing RLS policies
    - Ensure proper access controls
*/

-- Add new fields to quote_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'custom_message'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN custom_message text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'inspiration_images'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN inspiration_images text[] DEFAULT '{}';
  END IF;
END $$;

-- Insert sheds hero content section if it doesn't exist
INSERT INTO home_content (
  section_name,
  title,
  subtitle,
  content,
  cta_text,
  cta_link,
  is_active
) VALUES (
  'sheds_hero',
  'Custom-Built Sheds Designed for Your Lifestyle',
  'Quality craftsmanship meets personalized design',
  'From storage solutions to workshop spaces, we create sheds that perfectly match your needs and style preferences.',
  'Request a Custom Build',
  '#quote',
  true
) ON CONFLICT (section_name) DO NOTHING;

-- Update existing shed listings to include standard features and optional upgrades in specifications
UPDATE shed_listings 
SET specifications = COALESCE(specifications, '{}') || jsonb_build_object(
  'standard_features', ARRAY[
    'Pressure-treated floor joists',
    'Architectural shingles',
    'Pre-hung door with lock',
    'Two windows for natural light',
    'Painted trim and siding'
  ],
  'optional_upgrades', ARRAY[
    'Decorative shutters',
    'Loft storage area',
    'Roll-up garage door',
    'Metal roofing upgrade',
    'Electrical package',
    'Insulation package',
    'Workbench installation',
    'Additional windows'
  ]
)
WHERE specifications IS NULL OR NOT (specifications ? 'standard_features');