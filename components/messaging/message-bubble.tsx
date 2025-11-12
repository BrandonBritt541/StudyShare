'use client';

import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: {
    id: string;
    body: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
    profiles?: {
      first_name: string;
      last_initial?: string;
    };
  };
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for other user */}
      {!isCurrentUser && message.profiles && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-gray-700">
          {message.profiles.first_name?.[0]?.toUpperCase()}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-xs rounded-lg px-4 py-2 ${
          isCurrentUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="break-words text-sm">{message.body}</p>
        <p
          className={`mt-1 text-xs ${
            isCurrentUser ? 'text-primary-100' : 'text-gray-500'
          }`}
        >
          {timeAgo}
          {isCurrentUser && message.is_read && ' ✓'}
          {isCurrentUser && !message.is_read && ' ✗'}
        </p>
      </div>
    </div>
  );
}
