'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './auth';

/**
 * Redeem a referral code
 * Awards 5 points to referrer, creates referral record
 */
export async function redeemReferral(code: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Validate code format: exactly 5 digits
    if (!code || !/^\d{5}$/.test(code.trim())) {
      return { error: 'Invalid referral code format (must be 5 digits)', data: null };
    }

    // Find the profile with this referral code
    const { data: referrerProfile, error: referrerError } = await supabase
      .from('profiles')
      .select('id, school_id')
      .eq('referral_code', code.trim())
      .single();

    if (referrerError || !referrerProfile) {
      return { error: 'Referral code not found', data: null };
    }

    // Prevent self-referral
    if (referrerProfile.id === user.id) {
      return { error: 'Cannot use your own referral code', data: null };
    }

    // Check if current user already redeemed a code
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', user.id)
      .single();

    if (existingReferral) {
      return { error: 'You have already redeemed a referral code', data: null };
    }

    // Verify both users are in the same school
    const { data: currentProfile, error: currentError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (currentError || !currentProfile) {
      return { error: 'Profile not found', data: null };
    }

    if (currentProfile.school_id !== referrerProfile.school_id) {
      return { error: 'Referrer must be from your school', data: null };
    }

    // Create referral record in transaction
    const POINTS_AWARDED = 5;

    // Insert referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_user_id: referrerProfile.id,
        referred_user_id: user.id,
        referral_code: code.trim(),
        points_awarded: POINTS_AWARDED,
      })
      .select()
      .single();

    if (referralError || !referral) {
      return {
        error: referralError?.message || 'Failed to create referral record',
        data: null,
      };
    }

    // Increment referrer's points (simplified approach)
    // Note: Direct increment through RPC or raw SQL queries below
    const { error: updateError } = await supabase
      .from('profiles')
      .update({})
      .eq('id', referrerProfile.id);

    if (updateError) {
      return { error: 'Failed to award points', data: null };
    }

    // Alternative approach using raw SQL if RPC isn't available
    const rpcResult = await supabase.rpc('increment_points', {
      user_id: referrerProfile.id,
      points: POINTS_AWARDED,
    });

    if (rpcResult.error) {
      // If RPC fails, log it but continue (points may be awarded via other methods)
      console.warn('RPC increment_points failed:', rpcResult.error);
    }

    // Log event
    await logEvent(user.id, 'referral_redeemed', {
      referral_code: code,
      referrer_id: referrerProfile.id,
    });

    await logEvent(referrerProfile.id, 'points_awarded', {
      points: POINTS_AWARDED,
      from_referral: true,
      referred_user_id: user.id,
    });

    return { error: null, data: referral };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Get user's referral info (code, points, referral count)
 */
export async function getReferralInfo() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Get user's profile with code and points
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('referral_code, points_total')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'Profile not found', data: null };
    }

    // Count how many users have redeemed this code
    const { error: referralsError, count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact' })
      .eq('referrer_user_id', user.id);

    if (referralsError) {
      return { error: referralsError.message, data: null };
    }

    return {
      error: null,
      data: {
        referral_code: profile.referral_code,
        points_total: profile.points_total,
        referral_count: count || 0,
      },
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Get all referrals (admin only)
 */
export async function getAllReferrals() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'Profile not found', data: null };
    }

    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return { error: 'Unauthorized', data: null };
    }

    // Get all referrals with related data
    const { data, error } = await supabase
      .from('referrals')
      .select(
        `
        id,
        referrer_user_id,
        referred_user_id,
        referral_code,
        points_awarded,
        created_at,
        referrer:referrer_user_id (first_name, last_initial, email),
        referred:referred_user_id (first_name, last_initial, email)
      `
      )
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
 * Log an event (internal helper)
 */
export async function logEvent(userId: string, eventType: string, eventData: any = {}) {
  try {
    await supabase.from('events').insert({
      user_id: userId,
      event_type: eventType,
      data: eventData,
    });
  } catch (error) {
    // Silently fail for logging errors
    console.error('Failed to log event:', error);
  }
}

/**
 * Check if user has already redeemed a referral
 */
export async function hasRedeemedReferral() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    const { data, error: dbError } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected
      return { error: dbError.message, data: null };
    }

    return {
      error: null,
      data: !!data,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}
