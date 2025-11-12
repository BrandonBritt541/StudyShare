'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeMessages(
  threadId: string,
  onNewMessage: (message: any) => void
) {
  useEffect(() => {
    if (!threadId) return;

    // Subscribe to new messages in this thread using realtime channel
    const channel = supabase.channel(`messages:${threadId}`).on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload: any) => {
        onNewMessage(payload.new);
      }
    ).subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to messages:', threadId);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [threadId, onNewMessage]);
}
