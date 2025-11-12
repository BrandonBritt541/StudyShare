'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/server/actions/alerts';

interface Notification {
  id: string;
  type: string;
  message: string;
  listing_id?: string;
  alert_id?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user, isLoading: sessionLoading } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading || !user) return;

    const fetchNotifications = async () => {
      const result = await getNotifications(user.id);
      if (result.error) {
        setError(result.error);
      } else {
        setNotifications(result.data || []);
      }
      setIsLoading(false);
    };

    fetchNotifications();
  }, [user, sessionLoading]);

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    const result = await markNotificationAsRead(notificationId);

    if (result.error) {
      setError(result.error);
    } else {
      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    }

    setMarkingAsRead(null);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    const result = await markAllNotificationsAsRead(user.id);

    if (result.error) {
      setError(result.error);
    } else {
      setNotifications(notifications.map((notif) => ({ ...notif, is_read: true })));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
            Please log in to view your notifications.
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert_match':
        return '🔔';
      case 'message':
        return '💬';
      case 'sale':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert_match':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-green-50 border-green-200';
      case 'sale':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              Stay updated with alerts and messages from StudyShare
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="mb-4 text-gray-600">You're all caught up! No new notifications.</p>
            <Link
              href="/listings"
              className="inline-block rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 transition-colors ${
                  notification.is_read
                    ? 'bg-white border-gray-200'
                    : `${getNotificationColor(notification.type)} border-2`
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-2xl">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    {notification.listing_id && (
                      <Link
                        href={`/listings/${notification.listing_id}`}
                        className="rounded bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 hover:bg-primary-200 transition-colors"
                      >
                        View Listing
                      </Link>
                    )}
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markingAsRead === notification.id}
                        className="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        {markingAsRead === notification.id ? '...' : 'Mark Read'}
                      </button>
                    )}
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
