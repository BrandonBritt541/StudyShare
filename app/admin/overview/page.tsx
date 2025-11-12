'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/server/actions/auth';
import { getUserProfile } from '@/server/actions/profile';
import {
  getAnalyticsData,
  type AnalyticsData,
} from '@/server/actions/analytics';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: string;
}

function StatCard({ label, value, sublabel, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
}

interface StatGroupProps {
  title: string;
  stats: StatCardProps[];
}

function StatGroup({ title, stats }: StatGroupProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeWindow, setTimeWindow] = useState<'7d' | '30d'>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const user = await getCurrentUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Get user profile and check role
        const profile = await getUserProfile(user.id);

        if (!profile || !['admin', 'moderator'].includes(profile.role || '')) {
          router.push('/');
          return;
        }

        setIsAdmin(true);

        // Fetch analytics
        const result = await getAnalyticsData(timeWindow);
        if (result.error) {
          setError(result.error);
        } else {
          setAnalytics(result.data || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, timeWindow]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-primary-600 hover:text-primary-700">
              ← Back to Admin
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Analytics Overview</h1>
            <p className="mt-2 text-gray-600">
              Monitor platform metrics and activity
            </p>
          </div>

          {/* Time Window Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeWindow('7d')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                timeWindow === '7d'
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeWindow('30d')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                timeWindow === '30d'
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Analytics Content */}
        {analytics && (
          <div className="space-y-8">
            {/* Users */}
            <StatGroup
              title="Users"
              stats={[
                {
                  label: 'Total Users',
                  value: analytics.users.total,
                  icon: '👥',
                },
                {
                  label: `New Users (${timeWindow})`,
                  value: analytics.users.new,
                  sublabel: `${analytics.users.new} joined`,
                  icon: '✨',
                },
              ]}
            />

            {/* Listings */}
            <StatGroup
              title="Listings"
              stats={[
                {
                  label: 'Active Listings',
                  value: analytics.listings.active,
                  icon: '📦',
                },
                {
                  label: `New Listings (${timeWindow})`,
                  value: analytics.listings.new,
                  sublabel: `${analytics.listings.new} posted`,
                  icon: '📝',
                },
                {
                  label: 'Sold Listings',
                  value: analytics.listings.sold,
                  sublabel: `Total all-time`,
                  icon: '✅',
                },
              ]}
            />

            {/* Messages */}
            <StatGroup
              title="Messaging"
              stats={[
                {
                  label: `Messages Sent (${timeWindow})`,
                  value: analytics.messages.sent,
                  sublabel: `${analytics.messages.sent} messages`,
                  icon: '💬',
                },
                {
                  label: `Active Threads (${timeWindow})`,
                  value: analytics.messages.activeThreads,
                  sublabel: `With recent activity`,
                  icon: '🔗',
                },
              ]}
            />

            {/* Alerts & Notifications */}
            <StatGroup
              title="Alerts & Notifications"
              stats={[
                {
                  label: `Alerts Created (${timeWindow})`,
                  value: analytics.alerts.created,
                  sublabel: `14-day saved searches`,
                  icon: '🔔',
                },
                {
                  label: `Alerts Matched (${timeWindow})`,
                  value: analytics.alerts.matched,
                  sublabel: `Listings found`,
                  icon: '📌',
                },
              ]}
            />

            {/* Referrals */}
            <StatGroup
              title="Referrals & Points"
              stats={[
                {
                  label: `Referrals Redeemed (${timeWindow})`,
                  value: analytics.referrals.redeemed,
                  sublabel: `New redemptions`,
                  icon: '🎯',
                },
                {
                  label: 'Points Awarded',
                  value: analytics.referrals.pointsAwarded,
                  sublabel: `From referrals (${timeWindow})`,
                  icon: '⭐',
                },
                {
                  label: 'Unique Referrers',
                  value: analytics.referrals.uniqueReferrers,
                  sublabel: `In ${timeWindow}`,
                  icon: '🤝',
                },
              ]}
            />

            {/* Schedules */}
            <StatGroup
              title="Class Schedules"
              stats={[
                {
                  label: `Schedules Uploaded (${timeWindow})`,
                  value: analytics.schedules.uploaded,
                  sublabel: `New uploads`,
                  icon: '📚',
                },
                {
                  label: 'Total Schedule Entries',
                  value: analytics.schedules.uploads,
                  sublabel: `All-time uploads`,
                  icon: '📊',
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
