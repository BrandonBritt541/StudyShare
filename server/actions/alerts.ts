'use server';

import { supabase } from '@/lib/supabase';
import { alertSchema, type AlertInput } from '@/lib/validations';
import { getCurrentUser } from './auth';
import { z } from 'zod';

/**
 * Create an alert for a search query
 */
export async function createAlert(queryText: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Validate input
    const validated = alertSchema.parse({ queryText });

    // Get user's school
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'Profile not found', data: null };
    }

    // Calculate expiry (14 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    // Create alert
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        school_id: profile.school_id,
        query_text: validated.queryText,
        expires_at: expiresAt.toISOString(),
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
 * Get user's active alerts
 */
export async function getAlerts(userId: string) {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message, data: null };
    }

    // Add days remaining to each alert
    const alertsWithDays = (data || []).map((alert) => ({
      ...alert,
      daysRemaining: Math.ceil(
        (new Date(alert.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));

    return { error: null, data: alertsWithDays };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Delete an alert
 */
export async function deleteAlert(alertId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check ownership
    const { data: alert, error: getError } = await supabase
      .from('alerts')
      .select('user_id')
      .eq('id', alertId)
      .single();

    if (getError || !alert) {
      return { error: 'Alert not found' };
    }

    if (alert.user_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase.from('alerts').delete().eq('id', alertId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

/**
 * Get user's notifications
 */
export async function getNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message, data: null };
    }

    // Transform notifications to extract message from payload
    const transformedData = (data || []).map((notif: any) => ({
      ...notif,
      message: notif.payload?.message || 'You have a new notification',
      listing_id: notif.payload?.listing_id || null,
      alert_id: notif.payload?.alert_id || null,
    }));

    return { error: null, data: transformedData };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return { error: error.message, data: null };
    }

    return { error: null, data: count || 0 };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}
