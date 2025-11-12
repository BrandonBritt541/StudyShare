'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './auth';
import { getUserProfile } from './profile';

export interface AnalyticsData {
  timeWindow: '7d' | '30d';
  users: {
    total: number;
    new: number;
  };
  listings: {
    active: number;
    new: number;
    sold: number;
  };
  messages: {
    sent: number;
    activeThreads: number;
  };
  alerts: {
    created: number;
    matched: number;
  };
  referrals: {
    redeemed: number;
    pointsAwarded: number;
    uniqueReferrers: number;
  };
  schedules: {
    uploaded: number;
    uploads: number;
  };
}

/**
 * Get analytics data for a given time window (7d or 30d)
 */
export async function getAnalyticsData(
  timeWindow: '7d' | '30d' = '7d'
): Promise<{
  data?: AnalyticsData;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get user profile and check role
    const profileResult = await getUserProfile(user.id);
    if (profileResult.error || !profileResult.data || !profileResult.data.role || !['admin', 'moderator'].includes(profileResult.data.role)) {
      return { error: 'Only admins can view analytics' };
    }

    if (!profileResult.data.school_id) {
      return { error: 'User school not found' };
    }

    const schoolId = profileResult.data.school_id;
    const daysAgo = timeWindow === '7d' ? 7 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    // Get total users in school
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    // Get new users in timeWindow
    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('created_at', cutoffDate.toISOString());

    // Get active listings
    const { count: activeListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active');

    // Get new listings in timeWindow
    const { count: newListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('created_at', cutoffDate.toISOString());

    // Get sold listings
    const { count: soldListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'sold');

    // Get messages sent in timeWindow
    const { count: messagesSent } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffDate.toISOString());

    // Get active threads (threads with messages in timeWindow)
    const { data: activeThreadsData } = await supabase
      .from('message_threads')
      .select('id')
      .gte('last_message_at', cutoffDate.toISOString());

    const activeThreads = activeThreadsData?.length || 0;

    // Get alerts created in timeWindow
    const { count: alertsCreated } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('created_at', cutoffDate.toISOString());

    // Get matched alerts (notifications created from alerts in timeWindow)
    const { count: alertsMatched } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'alert_match')
      .gte('created_at', cutoffDate.toISOString());

    // Get referrals redeemed in timeWindow
    const { count: referralsRedeemed } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('created_at', cutoffDate.toISOString());

    // Get total points awarded (from referral events)
    const { data: pointsData } = await supabase
      .from('events')
      .select('data')
      .eq('event_type', 'points_awarded')
      .gte('created_at', cutoffDate.toISOString());

    const pointsAwarded = pointsData?.reduce((sum, event) => {
      const points = event.data?.points || 0;
      return sum + points;
    }, 0) || 0;

    // Get unique referrers
    const { data: referrersData } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('school_id', schoolId)
      .gte('created_at', cutoffDate.toISOString());

    const uniqueReferrers = new Set(
      referrersData?.map(r => r.referrer_id) || []
    ).size;

    // Get schedules uploaded in timeWindow
    const { count: schedulesUploaded } = await supabase
      .from('user_schedules')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffDate.toISOString());

    // Get total schedule uploads (entries)
    const { count: totalScheduleUploads } = await supabase
      .from('user_schedules')
      .select('*', { count: 'exact', head: true });

    return {
      data: {
        timeWindow,
        users: {
          total: totalUsers || 0,
          new: newUsers || 0,
        },
        listings: {
          active: activeListings || 0,
          new: newListings || 0,
          sold: soldListings || 0,
        },
        messages: {
          sent: messagesSent || 0,
          activeThreads,
        },
        alerts: {
          created: alertsCreated || 0,
          matched: alertsMatched || 0,
        },
        referrals: {
          redeemed: referralsRedeemed || 0,
          pointsAwarded,
          uniqueReferrers,
        },
        schedules: {
          uploaded: schedulesUploaded || 0,
          uploads: totalScheduleUploads || 0,
        },
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Query failed',
    };
  }
}
