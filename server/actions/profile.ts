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
 * Get list of active majors from database
 * Returns empty array if no majors found (client handles empty state)
 */
export async function getMajors() {
  try {
    const { data, error } = await supabase
      .from('majors')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    const majorNames = (data || []).map((m) => m.name);

    // Return empty array if no majors found (handled on client)
    return {
      error: null,
      data: majorNames.length > 0 ? majorNames : [],
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
