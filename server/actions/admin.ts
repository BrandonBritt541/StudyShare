'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './auth';

/**
 * Check if user is admin
 */
async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'admin' || data.role === 'moderator';
  } catch {
    return false;
  }
}

/**
 * Get all majors (with inactive)
 */
export async function getAllMajors() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        error: 'Not authenticated',
        data: null,
      };
    }

    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return {
        error: 'Unauthorized',
        data: null,
      };
    }

    const { data, error } = await supabase
      .from('majors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    return {
      error: null,
      data: data || [],
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
      data: null,
    };
  }
}

/**
 * Create a new major
 */
export async function createMajor(name: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        error: 'Not authenticated',
        data: null,
      };
    }

    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return {
        error: 'Unauthorized',
        data: null,
      };
    }

    if (!name || name.trim().length === 0) {
      return {
        error: 'Major name is required',
        data: null,
      };
    }

    const { data, error } = await supabase
      .from('majors')
      .insert({ name: name.trim(), is_active: true })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          error: 'This major already exists',
          data: null,
        };
      }
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
 * Update major (toggle active status)
 */
export async function updateMajor(majorId: string, isActive: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        error: 'Not authenticated',
        data: null,
      };
    }

    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return {
        error: 'Unauthorized',
        data: null,
      };
    }

    const { data, error } = await supabase
      .from('majors')
      .update({ is_active: isActive })
      .eq('id', majorId)
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
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
      data: null,
    };
  }
}

/**
 * Delete major
 */
export async function deleteMajor(majorId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        error: 'Not authenticated',
        data: null,
      };
    }

    const isAdmin = await isUserAdmin(user.id);
    if (!isAdmin) {
      return {
        error: 'Unauthorized',
        data: null,
      };
    }

    const { error } = await supabase.from('majors').delete().eq('id', majorId);

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      error: null,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}
