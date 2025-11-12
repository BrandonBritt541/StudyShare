'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { getMessages, markThreadAsRead, reportMessage, reportUser } from '@/server/actions/messaging';
import { MessageBubble } from '@/components/messaging/message-bubble';
import { MessageComposer } from '@/components/messaging/message-composer';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';

interface Message {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  thread_id: string;
  profiles?: Array<{
    first_name: string;
    last_initial?: string;
  }>;
}

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const { user, isLoading: sessionLoading } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportMenu, setShowReportMenu] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial messages
  useEffect(() => {
    if (sessionLoading || !user) return;

    const fetchMessages = async () => {
      const result = await getMessages(params.threadId);
      if (result.error) {
        setError(result.error);
      } else {
        setMessages(result.data || []);
        // Mark thread as read
        await markThreadAsRead(params.threadId);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [user, sessionLoading, params.threadId]);

  // Setup realtime subscription
  useRealtimeMessages(params.threadId, (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  });

  const handleReportMessage = async (messageId: string) => {
    if (!reportReason.trim()) {
      setError('Please provide a reason');
      return;
    }

    const result = await reportMessage(messageId, reportReason);
    if (result.error) {
      setError(result.error);
    } else {
      setShowReportMenu(null);
      setReportReason('');
      alert('Report submitted. Our team will review it shortly.');
    }
  };

  const handleReportUser = async (userId: string) => {
    if (!reportReason.trim()) {
      setError('Please provide a reason');
      return;
    }

    const result = await reportUser(userId, reportReason);
    if (result.error) {
      setError(result.error);
    } else {
      setShowReportMenu(null);
      setReportReason('');
      alert('Report submitted. Our team will review it shortly.');
    }
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
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <Link href="/messages" className="text-primary-600 hover:text-primary-700 font-medium mb-4 block">
            ← Back to Messages
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chat</h1>
              <p className="text-sm text-gray-600">Thread ID: {params.threadId}</p>
            </div>
            <button
              onClick={() => setShowReportMenu(showReportMenu ? null : 'menu')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ⋮ More
            </button>
          </div>

          {/* Report Menu */}
          {showReportMenu === 'menu' && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">Report</p>
              <button
                onClick={() => setShowReportMenu('report-user')}
                className="block w-full text-left text-sm text-gray-700 hover:text-red-600 mb-2"
              >
                Report user...
              </button>
              <button
                onClick={() => setShowReportMenu('report-message')}
                className="block w-full text-left text-sm text-gray-700 hover:text-red-600"
              >
                Report message...
              </button>
            </div>
          )}

          {/* Report User Dialog */}
          {showReportMenu === 'report-user' && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">Report User</p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this user?"
                className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Find the other user ID
                    const otherUserId = messages.length > 0 ? messages[0].sender_id : null;
                    if (otherUserId && otherUserId !== user.id) {
                      handleReportUser(otherUserId);
                    }
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Submit Report
                </button>
                <button
                  onClick={() => setShowReportMenu(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Report Message Dialog */}
          {showReportMenu === 'report-message' && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">Report Message</p>
              <p className="mb-3 text-xs text-gray-600">Select a message and provide a reason</p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this message?"
                className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // In real implementation, would select message first
                    if (messages.length > 0) {
                      handleReportMessage(messages[0].id);
                    }
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Submit Report
                </button>
                <button
                  onClick={() => setShowReportMenu(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {isLoading ? (
            <div className="text-center text-gray-600">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-600">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isCurrentUser={msg.sender_id === user.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <MessageComposer
        threadId={params.threadId}
        onMessageSent={() => {
          // Messages will be updated via realtime subscription
        }}
      />
    </div>
  );
}
