'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { getUnreadNotificationCount } from '@/server/actions/alerts';

export function NotificationBell() {
  const { user, isLoading } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoading || !user) return;

    const fetchUnreadCount = async () => {
      const result = await getUnreadNotificationCount(user.id);
      if (!result.error && result.data !== null) {
        setUnreadCount(result.data);
      }
    };

    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  return (
    <Link href="/notifications" className="relative">
      <button className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </Link>
  );
}
