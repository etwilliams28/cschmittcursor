import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read environment variables
const supabaseUrl = 'https://urwbmnxzqhsnougardjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyd2Jtbnh6cWhzbm91Z2FyZGprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE3NzI1MiwiZXhwIjoyMDY5NzUzMjUyfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Migration SQL
const migrationSQL = `
-- Add social media fields to business_settings table
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
`;

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Run the migration using rpc (we'll need to create a function for this)
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.log('❌ Error running migration:', error);
      console.log('📝 You may need to run this manually in Supabase dashboard');
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Your Facebook and Instagram fields are now available!');
    
  } catch (error) {
    console.log('❌ Migration failed:', error.message);
    console.log('📝 Please run the migration manually in Supabase dashboard');
  }
}

runMigration();
