'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { getAllReferrals } from '@/server/actions/referrals';
import { formatDistanceToNow } from 'date-fns';

interface Referral {
  id: string;
  referral_code: string;
  points_awarded: number;
  created_at: string;
  referrer: Array<{
    first_name: string;
    last_initial?: string;
    email: string;
  }>;
  referred: Array<{
    first_name: string;
    last_initial?: string;
    email: string;
  }>;
}

export default function AdminReferralsPage() {
  const { user, isLoading: sessionLoading } = useSession();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading || !user) return;

    const fetchReferrals = async () => {
      const result = await getAllReferrals();
      if (result.error) {
        setError(result.error);
      } else {
        setReferrals(result.data || []);
      }
      setIsLoading(false);
    };

    fetchReferrals();
  }, [user, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700 mb-4">
            Please log in to view admin panel.
          </div>
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-primary-600 hover:text-primary-700 font-medium mb-4 block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
          <p className="text-gray-600">Track all referral redemptions and points awarded</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">Loading referrals...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No referrals yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Referred User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">
                          {referral.referred?.[0]?.first_name} {referral.referred?.[0]?.last_initial || ''}
                        </p>
                        <p className="text-xs text-gray-500">{referral.referred?.[0]?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">
                          {referral.referrer?.[0]?.first_name} {referral.referrer?.[0]?.last_initial || ''}
                        </p>
                        <p className="text-xs text-gray-500">{referral.referrer?.[0]?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <code className="rounded bg-gray-100 px-2 py-1 font-mono font-semibold text-gray-900">
                        {referral.referral_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="rounded-full bg-primary-100 px-3 py-1 font-medium text-primary-700">
                        +{referral.points_awarded}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        {referrals.length > 0 && (
          <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm text-gray-600">Total Referrals</p>
              <p className="text-3xl font-bold text-gray-900">{referrals.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm text-gray-600">Total Points Awarded</p>
              <p className="text-3xl font-bold text-gray-900">
                {referrals.reduce((sum, r) => sum + r.points_awarded, 0)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm text-gray-600">Unique Referrers</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Set(referrals.map((r) => r.referrer?.[0]?.email)).size}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
