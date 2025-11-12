'use server';

import { supabase } from '@/lib/supabase';
import {
  uploadScheduleImage,
  deleteScheduleImages,
} from '@/lib/schedule-upload';
import { getCurrentUser } from './auth';
import { getUserProfile } from './profile';
import { logEvent } from './referrals';

export interface ScheduleEntry {
  id: string;
  user_id: string;
  image_urls: string[];
  created_at: string;
}

/**
 * Upload schedule images for the current user
 */
export async function uploadScheduleImages(
  files: File[]
): Promise<{
  success: boolean;
  data?: ScheduleEntry;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user profile for school_id
    const profileResult = await getUserProfile(user.id);
    if (profileResult.error || !profileResult.data || !profileResult.data.school_id) {
      return { success: false, error: 'User profile not found' };
    }
    const profile = profileResult.data;

    // Validate file count
    if (files.length === 0 || files.length > 10) {
      return {
        success: false,
        error: 'Upload 1-10 images at a time',
      };
    }

    // Upload each file and collect URLs
    const imageUrls: string[] = [];
    let totalBytes = 0;

    for (const file of files) {
      const result = await uploadScheduleImage(file, user.id);

      if (result.error || !result.url) {
        return {
          success: false,
          error: result.error || 'Failed to upload image',
        };
      }

      imageUrls.push(result.url);
      totalBytes += file.size;
    }

    // Store in database
    const { data, error } = await supabase
      .from('user_schedules')
      .insert({
        user_id: user.id,
        school_id: profile.school_id,
        image_urls: imageUrls,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Log event for analytics
    await logEvent(user.id, 'schedule_images_uploaded', {
      count: files.length,
      bytes: totalBytes,
    });

    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.user_id,
        image_urls: data.image_urls,
        created_at: data.created_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get all schedule uploads for the current user
 */
export async function getScheduleImages(): Promise<{
  data?: ScheduleEntry[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('user_schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return {
      data: data.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        image_urls: row.image_urls || [],
        created_at: row.created_at,
      })),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch schedules',
    };
  }
}

/**
 * Delete a schedule entry and its images from storage
 */
export async function deleteScheduleEntry(scheduleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch the schedule entry to verify ownership and get image URLs
    const { data: schedule, error: fetchError } = await supabase
      .from('user_schedules')
      .select('*')
      .eq('id', scheduleId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !schedule) {
      return {
        success: false,
        error: 'Schedule not found or you do not have permission',
      };
    }

    // Delete images from storage
    if (schedule.image_urls && schedule.image_urls.length > 0) {
      const deleteResult = await deleteScheduleImages(schedule.image_urls);
      if (deleteResult.error) {
        return {
          success: false,
          error: `Failed to delete images: ${deleteResult.error}`,
        };
      }
    }

    // Delete database entry
    const { error: deleteError } = await supabase
      .from('user_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', user.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Log event for analytics
    await logEvent(user.id, 'schedule_deleted', {
      schedule_id: scheduleId,
      image_count: schedule.image_urls?.length || 0,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get count of schedule uploads (for analytics)
 */
export async function getScheduleImageCount(
  userId: string
): Promise<{
  data?: number;
  error?: string;
}> {
  try {
    const { count, error } = await supabase
      .from('user_schedules')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      return { error: error.message };
    }

    return { data: count || 0 };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Query failed',
    };
  }
}
