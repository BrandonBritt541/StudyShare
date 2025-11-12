'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { getThreads } from '@/server/actions/messaging';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  id: string;
  listing_id: string;
  created_at: string;
  last_message_at: string;
  unreadCount: number;
  otherParticipantName: string;
  lastMessage: string;
  listings: {
    id: string;
    title: string;
    images?: string[];
  };
}

export default function MessagesPage() {
  const { user, isLoading: sessionLoading } = useSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading || !user) return;

    const fetchThreads = async () => {
      const result = await getThreads();
      if (result.error) {
        setError(result.error);
      } else {
        setThreads(result.data || []);
      }
      setIsLoading(false);
    };

    fetchThreads();
  }, [user, sessionLoading]);

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
            Please log in to view messages.
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
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Your conversations with buyers and sellers</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="mb-4 text-gray-600">No conversations yet.</p>
            <p className="mb-6 text-sm text-gray-500">
              Start a conversation by messaging a seller from a listing.
            </p>
            <Link
              href="/listings"
              className="inline-block rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => {
              const listing = thread.listings;
              const thumbnailUrl = listing?.images?.[0] || '/placeholder-image.png';
              const timeAgo = formatDistanceToNow(new Date(thread.last_message_at), {
                addSuffix: true,
              });

              return (
                <Link key={thread.id} href={`/messages/${thread.id}`}>
                  <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer">
                    {/* Listing thumbnail */}
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={thumbnailUrl}
                        alt={listing?.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Thread info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {listing?.title}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="flex-shrink-0 rounded-full bg-primary-600 px-2 py-1 text-xs font-bold text-white">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 truncate mb-1">
                        {thread.otherParticipantName}
                      </p>

                      <p className="text-sm text-gray-500 truncate mb-1">
                        {thread.lastMessage}
                      </p>

                      <p className="text-xs text-gray-400">{timeAgo}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
