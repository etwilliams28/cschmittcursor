import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket helpers
export const getImageUrl = (bucket: string, path: string) => {
  if (!path) return '';
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

// Debug function to check bucket status
export const checkBucketStatus = async (bucketName: string) => {
  try {
    console.log(`Checking bucket: ${bucketName}`);
    
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets?.map(b => b.name));
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { exists: false, error: listError.message };
    }
    
    const bucketExists = buckets?.some(b => b.name === bucketName);
    console.log(`Bucket ${bucketName} exists:`, bucketExists);
    
    return { exists: bucketExists, buckets };
  } catch (error) {
    console.error('Error in checkBucketStatus:', error);
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Create bucket with proper policies
export const createImagesBucket = async () => {
  try {
    console.log('Creating images bucket...');
    
    // Note: Bucket creation via client-side code is restricted by RLS policies
    // This function now just provides instructions for manual creation
    throw new Error('MANUAL_CREATION_REQUIRED');
  } catch (error) {
    console.error('Error in createImagesBucket:', error);
    throw error;
  }
};

export const uploadImage = async (bucket: string, path: string, file: File) => {
  try {
    console.log(`Starting upload to bucket: ${bucket}, path: ${path}`);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    // Attempt the upload
    console.log('Attempting file upload...');
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { 
        upsert: true,
        contentType: file.type
      });
    
    if (error) {
      console.error('Upload error:', error);
      
      // If bucket not found, provide helpful message
      if (error.message.includes('Bucket not found') || error.message.includes('does not exist')) {
        // Check bucket status for debugging
        const bucketStatus = await checkBucketStatus(bucket);
        console.log('Bucket check result:', bucketStatus);
        
        throw new Error(`Storage bucket '${bucket}' not found. Available buckets: ${bucketStatus.buckets?.map(b => b.name).join(', ') || 'none'}. Please verify the bucket name and permissions.`);
      }
      
      // For other errors, provide the original message
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    console.log('Upload successful:', data);
    return data.path;
    
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
}