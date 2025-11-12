import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'schedules';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload a schedule image to Supabase Storage
 */
export async function uploadScheduleImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file
    if (!file) {
      return { url: null, error: 'No file selected' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        url: null,
        error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        url: null,
        error: 'Invalid file type (JPG, PNG, WEBP only)',
      };
    }

    // Create unique file path: /user_id/timestamp-filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = `${userId}/${filename}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: publicData?.publicUrl || null,
      error: null,
    };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a schedule image from storage
 */
export async function deleteScheduleImage(imageUrl: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    if (!imageUrl) {
      return { success: false, error: 'No URL provided' };
    }

    // Extract file path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/schedules/user_id/filename
    const pathMatch = imageUrl.match(/schedules\/(.+)$/);
    if (!pathMatch) {
      return { success: false, error: 'Invalid image URL' };
    }

    const filePath = pathMatch[1];

    // Delete from storage
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Delete multiple schedule images
 */
export async function deleteScheduleImages(imageUrls: string[]): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    if (!imageUrls || imageUrls.length === 0) {
      return { success: true, error: null };
    }

    // Extract file paths
    const filePaths = imageUrls.map((url) => {
      const pathMatch = url.match(/schedules\/(.+)$/);
      return pathMatch ? pathMatch[1] : null;
    }).filter((path): path is string => path !== null);

    if (filePaths.length === 0) {
      return { success: true, error: null };
    }

    // Delete all files
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}
