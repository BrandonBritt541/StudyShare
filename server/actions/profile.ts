'use server';

import { supabase } from '@/lib/supabase';
import { profileSchema } from '@/lib/validations';
import { z } from 'zod';

type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        email,
        first_name,
        last_initial,
        major,
        college_year,
        grad_year,
        photo_url,
        referral_code,
        points_total,
        role,
        created_at,
        school_id,
        schools(name, domain)
      `,
      )
      .eq('id', userId)
      .single();

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    return {
      error: null,
      data,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
      data: null,
    };
  }
}

/**
 * Update user profile with setup information
 */
export async function updateProfile(userId: string, input: Partial<ProfileInput>) {
  try {
    // Validate input
    const validated = profileSchema.parse(input);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: validated.firstName,
        last_initial: validated.lastInitial,
        major: validated.major,
        college_year: validated.collegeYear,
        grad_year: validated.gradYear,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    return {
      error: null,
      data,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
        data: null,
      };
    }
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
      data: null,
    };
  }
}

/**
 * Get list of majors for dropdown
 */
export async function getMajors() {
  try {
    // Common college majors - can be extended or fetched from database
    const majors = [
      'Computer Science',
      'Engineering',
      'Business',
      'Economics',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Psychology',
      'English',
      'History',
      'Political Science',
      'Sociology',
      'Art',
      'Music',
      'Education',
      'Nursing',
      'Medicine',
      'Law',
      'Architecture',
      'Environmental Science',
      'Marine Biology',
      'Geology',
      'Astronomy',
      'Philosophy',
      'Linguistics',
      'Communication',
      'Journalism',
      'Film',
      'Dance',
      'Theater',
      'Athletics',
      'Nutrition',
      'Agriculture',
      'Forestry',
      'Other',
    ].sort();

    return {
      error: null,
      data: majors,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
      data: null,
    };
  }
}

/**
 * Get user's school information
 */
export async function getUserSchool(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
        school_id,
        schools(id, name, domain, city, state)
      `,
      )
      .eq('id', userId)
      .single();

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    return {
      error: null,
      data: data?.schools,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
      data: null,
    };
  }
}

/**
 * Check if user profile is set up (has first name)
 */
export async function isProfileSetUp(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return !!data.first_name;
  } catch {
    return false;
  }
}
