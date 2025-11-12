'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './auth';
import { getUserProfile } from './profile';
import { logEvent } from './referrals';

export interface Course {
  id: string;
  school_id: string;
  code: string;
  name: string;
  professor_names: string[];
  common_materials: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Create a new course (admin only)
 */
export async function createCourse(data: {
  code: string;
  name: string;
  professor_names: string[];
  common_materials: string[];
}): Promise<{
  success: boolean;
  data?: Course;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user profile and check role
    const profile = await getUserProfile(user.id);
    if (!profile || !['admin', 'moderator'].includes(profile.role || '')) {
      return { success: false, error: 'Only admins can create courses' };
    }

    // Validate input
    if (!data.code || !data.name) {
      return { success: false, error: 'Course code and name are required' };
    }

    // Validate professor and materials are arrays
    const professors = Array.isArray(data.professor_names)
      ? data.professor_names.filter(p => typeof p === 'string' && p.trim())
      : [];
    const materials = Array.isArray(data.common_materials)
      ? data.common_materials.filter(m => typeof m === 'string' && m.trim())
      : [];

    // Create course
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        school_id: profile.school_id,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        professor_names: professors,
        common_materials: materials,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log event for analytics
    await logEvent(user.id, 'course_created', {
      course_id: course.id,
      course_code: course.code,
    });

    return {
      success: true,
      data: {
        id: course.id,
        school_id: course.school_id,
        code: course.code,
        name: course.name,
        professor_names: course.professor_names || [],
        common_materials: course.common_materials || [],
        created_at: course.created_at,
        updated_at: course.updated_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Create failed',
    };
  }
}

/**
 * Update a course (admin only)
 */
export async function updateCourse(
  courseId: string,
  data: {
    code?: string;
    name?: string;
    professor_names?: string[];
    common_materials?: string[];
  }
): Promise<{
  success: boolean;
  data?: Course;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user profile and check role
    const profile = await getUserProfile(user.id);
    if (!profile || !['admin', 'moderator'].includes(profile.role || '')) {
      return { success: false, error: 'Only admins can update courses' };
    }

    // Build update object
    const updateData: any = {};
    if (data.code) updateData.code = data.code.trim().toUpperCase();
    if (data.name) updateData.name = data.name.trim();
    if (data.professor_names) {
      updateData.professor_names = data.professor_names.filter(
        p => typeof p === 'string' && p.trim()
      );
    }
    if (data.common_materials) {
      updateData.common_materials = data.common_materials.filter(
        m => typeof m === 'string' && m.trim()
      );
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No data to update' };
    }

    // Update course
    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    // Log event for analytics
    await logEvent(user.id, 'course_updated', {
      course_id: course.id,
      course_code: course.code,
    });

    return {
      success: true,
      data: {
        id: course.id,
        school_id: course.school_id,
        code: course.code,
        name: course.name,
        professor_names: course.professor_names || [],
        common_materials: course.common_materials || [],
        created_at: course.created_at,
        updated_at: course.updated_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}

/**
 * Delete a course (admin only)
 */
export async function deleteCourse(courseId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get user profile and check role
    const profile = await getUserProfile(user.id);
    if (!profile || !['admin', 'moderator'].includes(profile.role || '')) {
      return { success: false, error: 'Only admins can delete courses' };
    }

    // Delete course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('school_id', profile.school_id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log event for analytics
    await logEvent(user.id, 'course_deleted', {
      course_id: courseId,
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
 * Get all courses for the user's school
 */
export async function getCourses(): Promise<{
  data?: Course[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const profile = await getUserProfile(user.id);
    if (!profile) {
      return { error: 'User profile not found' };
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('code', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return {
      data: data.map(row => ({
        id: row.id,
        school_id: row.school_id,
        code: row.code,
        name: row.name,
        professor_names: row.professor_names || [],
        common_materials: row.common_materials || [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Query failed',
    };
  }
}

/**
 * Search courses by code or name
 */
export async function searchCourses(query: string): Promise<{
  data?: Course[];
  error?: string;
}> {
  try {
    if (!query || query.trim().length === 0) {
      return { data: [] };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const profile = await getUserProfile(user.id);
    if (!profile) {
      return { error: 'User profile not found' };
    }

    const searchTerm = `%${query.trim()}%`;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('school_id', profile.school_id)
      .or(`code.ilike.${searchTerm},name.ilike.${searchTerm}`)
      .order('code', { ascending: true })
      .limit(50);

    if (error) {
      return { error: error.message };
    }

    return {
      data: data.map(row => ({
        id: row.id,
        school_id: row.school_id,
        code: row.code,
        name: row.name,
        professor_names: row.professor_names || [],
        common_materials: row.common_materials || [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string): Promise<{
  data?: Course;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const profile = await getUserProfile(user.id);
    if (!profile) {
      return { error: 'User profile not found' };
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('school_id', profile.school_id)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Course not found' };
    }

    return {
      data: {
        id: data.id,
        school_id: data.school_id,
        code: data.code,
        name: data.name,
        professor_names: data.professor_names || [],
        common_materials: data.common_materials || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Query failed',
    };
  }
}
