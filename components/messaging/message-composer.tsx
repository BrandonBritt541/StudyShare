'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '@/server/actions/messaging';

interface MessageComposerProps {
  threadId: string;
  onMessageSent?: () => void;
}

const QUICK_REPLIES = [
  'Is this still available?',
  'Can you meet on campus?',
  'Is the price flexible?',
  'What condition is it in?',
  'When can I pick it up?',
];

export function MessageComposer({ threadId, onMessageSent }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSend = async (text: string = message) => {
    if (!text.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setIsSending(true);
    setError(null);

    const result = await sendMessage(threadId, text);

    if (result.error) {
      setError(result.error);
      setIsSending(false);
    } else {
      setMessage('');
      setShowQuickReplies(true);
      onMessageSent?.();
      setIsSending(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {error && <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</div>}

      {/* Quick Replies */}
      {showQuickReplies && message.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => handleQuickReply(reply)}
              disabled={isSending}
              className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Message Composer */}
      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message... (Shift+Enter for new line)"
          disabled={isSending}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          rows={1}
          style={{ minHeight: '44px', maxHeight: '200px' }}
        />
        <button
          onClick={() => handleSend()}
          disabled={isSending || !message.trim()}
          className="rounded-lg bg-primary-600 px-4 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Info text */}
      <p className="mt-2 text-xs text-gray-500">
        Phone numbers, emails, and payment info are OK to share in chat.
      </p>
    </div>
  );
}
