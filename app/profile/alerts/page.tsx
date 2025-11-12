'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { getAlerts, deleteAlert } from '@/server/actions/alerts';

interface Alert {
  id: string;
  query_text: string;
  expires_at: string;
  created_at: string;
  daysRemaining: number;
}

export default function AlertsPage() {
  const { user, isLoading: sessionLoading } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading || !user) return;

    const fetchAlerts = async () => {
      const result = await getAlerts(user.id);
      if (result.error) {
        setError(result.error);
      } else {
        setAlerts(result.data || []);
      }
      setIsLoading(false);
    };

    fetchAlerts();
  }, [user, sessionLoading]);

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    setDeletingId(alertId);
    const result = await deleteAlert(alertId);

    if (result.error) {
      setError(result.error);
    } else {
      setAlerts(alerts.filter((alert) => alert.id !== alertId));
    }

    setDeletingId(null);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700 mb-4">
            Please log in to view your alerts.
          </div>
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notify-Me Alerts</h1>
          <p className="text-gray-600">
            Manage your search alerts. You'll be notified when new listings match your search.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="mb-4 text-gray-600">You don't have any active alerts yet.</p>
            <p className="mb-6 text-sm text-gray-500">
              Go to Browse Listings and use the "Notify Me" button when you don't find what you're
              looking for.
            </p>
            <Link
              href="/listings"
              className="inline-block rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Alert Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                      "{alert.query_text}"
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Expires in:</span> {alert.daysRemaining} day
                        {alert.daysRemaining !== 1 ? 's' : ''}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(alert.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    disabled={deletingId === alert.id}
                    className="flex-shrink-0 rounded-lg border-2 border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {deletingId === alert.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 transition-all"
                      style={{ width: `${(alert.daysRemaining / 14) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
