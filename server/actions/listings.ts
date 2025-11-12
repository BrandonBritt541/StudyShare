'use server';

import { supabase } from '@/lib/supabase';
import { listingSchema, listingFiltersSchema, type ListingInput, type ListingFilters } from '@/lib/validations';
import { getCurrentUser } from './auth';
import { z } from 'zod';

/**
 * Create a new listing
 */
export async function createListing(input: ListingInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Validate input
    const validated = listingSchema.parse(input);

    // Get user profile to get school_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'Profile not found', data: null };
    }

    // Create listing
    const { data, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        school_id: profile.school_id,
        title: validated.title,
        description: validated.description || null,
        type: validated.type,
        quality: validated.quality,
        price_cents: validated.priceCents,
        course_code: validated.courseCode || null,
        course_title: validated.courseTitle || null,
        professor: validated.professor || null,
        major: validated.major || null,
        images: validated.imageUrls,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { error: null, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, data: null };
    }
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Update a listing
 */
export async function updateListing(listingId: string, input: Partial<ListingInput>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Check ownership
    const { data: listing, error: getError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', listingId)
      .single();

    if (getError || !listing) {
      return { error: 'Listing not found', data: null };
    }

    if (listing.seller_id !== user.id) {
      return { error: 'Unauthorized', data: null };
    }

    // Partial validation (allow partial updates)
    const validated = listingSchema.partial().parse(input);

    const { data, error } = await supabase
      .from('listings')
      .update({
        ...(validated.title && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.type && { type: validated.type }),
        ...(validated.quality && { quality: validated.quality }),
        ...(validated.priceCents !== undefined && { price_cents: validated.priceCents }),
        ...(validated.courseCode !== undefined && { course_code: validated.courseCode }),
        ...(validated.courseTitle !== undefined && { course_title: validated.courseTitle }),
        ...(validated.professor !== undefined && { professor: validated.professor }),
        ...(validated.major !== undefined && { major: validated.major }),
        ...(validated.imageUrls && { images: validated.imageUrls }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { error: null, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, data: null };
    }
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Mark a listing as sold
 */
export async function markListingAsSold(listingId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Check ownership
    const { data: listing, error: getError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', listingId)
      .single();

    if (getError || !listing) {
      return { error: 'Listing not found', data: null };
    }

    if (listing.seller_id !== user.id) {
      return { error: 'Unauthorized', data: null };
    }

    const { data, error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { error: null, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check ownership
    const { data: listing, error: getError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', listingId)
      .single();

    if (getError || !listing) {
      return { error: 'Listing not found' };
    }

    if (listing.seller_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase.from('listings').delete().eq('id', listingId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

/**
 * Get a single listing
 */
export async function getListing(listingId: string) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        profiles!seller_id(first_name, last_initial, major, college_year, referral_code)
      `,
      )
      .eq('id', listingId)
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { error: null, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Get user's listings
 */
export async function getUserListings(userId: string) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message, data: null };
    }

    return { error: null, data: data || [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Search and filter listings with pagination
 */
export async function searchListings(filters: ListingFilters) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Get user's school
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'Profile not found', data: null };
    }

    const validated = listingFiltersSchema.parse(filters);
    const pageSize = 12;
    const offset = (validated.page - 1) * pageSize;

    // Build query
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id)
      .eq('status', 'active');

    // Apply filters
    if (validated.types && validated.types.length > 0) {
      query = query.in('type', validated.types);
    }

    if (validated.qualities && validated.qualities.length > 0) {
      query = query.in('quality', validated.qualities);
    }

    if (validated.major) {
      query = query.eq('major', validated.major);
    }

    if (validated.courseCode) {
      query = query.ilike('course_code', `%${validated.courseCode}%`);
    }

    if (validated.professor) {
      query = query.ilike('professor', `%${validated.professor}%`);
    }

    if (validated.priceMin !== undefined) {
      query = query.gte('price_cents', validated.priceMin);
    }

    if (validated.priceMax !== undefined) {
      query = query.lte('price_cents', validated.priceMax);
    }

    if (validated.search) {
      query = query.ilike('title', `%${validated.search}%`);
    }

    // Apply sorting
    switch (validated.sortBy) {
      case 'price_asc':
        query = query.order('price_cents', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_cents', { ascending: false });
        break;
      case 'relevance':
        query = query.order('created_at', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Paginate
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      return { error: error.message, data: null };
    }

    return {
      error: null,
      data: {
        listings: data || [],
        total: count || 0,
        page: validated.page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, data: null };
    }
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}
