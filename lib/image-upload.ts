import { supabase } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8;

/**
 * Compress image file client-side
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if needed
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width *= scale;
          height *= scale;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          QUALITY,
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to Supabase Storage
 * Validates, compresses, and uploads
 */
export async function uploadListingImage(
  file: File,
  listingId: string,
): Promise<{
  url: string | null;
  error: string | null;
}> {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        url: null,
        error: 'Only JPG, PNG, and WebP images are allowed',
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: null,
        error: 'Image must be less than 5MB',
      };
    }

    // Compress image
    const compressedBlob = await compressImage(file);

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${listingId}/${timestamp}-${random}.jpg`;

    // Upload to Storage
    const { data, error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filename, compressedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      return {
        url: null,
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      error: null,
    };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Delete image from Storage
 */
export async function deleteListingImage(imageUrl: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const path = url.pathname.split('/storage/v1/object/public/listing-images/')[1];

    if (!path) {
      return {
        success: false,
        error: 'Invalid image URL',
      };
    }

    const { error } = await supabase.storage
      .from('listing-images')
      .remove([path]);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}
