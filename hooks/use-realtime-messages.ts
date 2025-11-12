'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeMessages(
  threadId: string,
  onNewMessage: (message: any) => void
) {
  useEffect(() => {
    if (!threadId) return;

    // Subscribe to new messages in this thread
    const subscription = supabase
      .from(`messages:thread_id=eq.${threadId}`)
      .on('INSERT', (payload) => {
        onNewMessage(payload.new);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to messages:', threadId);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [threadId, onNewMessage]);
}
