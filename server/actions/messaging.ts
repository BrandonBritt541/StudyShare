'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './auth';
import { filterProfanity } from '@/lib/profanity-filter';
import { z } from 'zod';

/**
 * Create or get an existing message thread
 * Ensures one thread per buyer-listing pair
 */
export async function createOrGetThread(
  listingId: string,
  sellerId: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Prevent seller from messaging themselves
    if (user.id === sellerId) {
      return { error: 'Cannot message yourself', data: null };
    }

    // Get seller's school to verify both users are in same school
    const { data: sellerProfile, error: sellerError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', sellerId)
      .single();

    if (sellerError || !sellerProfile) {
      return { error: 'Seller not found', data: null };
    }

    // Get buyer's school (current user)
    const { data: buyerProfile, error: buyerError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (buyerError || !buyerProfile) {
      return { error: 'Profile not found', data: null };
    }

    // Verify both users in same school
    if (buyerProfile.school_id !== sellerProfile.school_id) {
      return { error: 'Users must be in the same school', data: null };
    }

    // Try to get existing thread
    const { data: existingThread, error: getError } = await supabase
      .from('message_threads')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('listing_id', listingId)
      .single();

    // If thread exists, return it
    if (existingThread && !getError) {
      return { error: null, data: existingThread };
    }

    // Create new thread
    const { data: newThread, error: createError } = await supabase
      .from('message_threads')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
        school_id: buyerProfile.school_id,
      })
      .select()
      .single();

    if (createError || !newThread) {
      return { error: createError?.message || 'Failed to create thread', data: null };
    }

    return { error: null, data: newThread };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Send a message in a thread
 * Auto-redacts profanity, does not block
 */
export async function sendMessage(threadId: string, body: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Validate input
    if (!body || body.trim().length === 0) {
      return { error: 'Message cannot be empty', data: null };
    }

    if (body.length > 5000) {
      return { error: 'Message too long (max 5000 characters)', data: null };
    }

    // Verify user is part of this thread
    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .select('id, buyer_id, seller_id, listing_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return { error: 'Thread not found', data: null };
    }

    if (user.id !== thread.buyer_id && user.id !== thread.seller_id) {
      return { error: 'Unauthorized', data: null };
    }

    // Apply profanity filter (redacts but doesn't block)
    const filteredBody = filterProfanity(body.trim());

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        body: filteredBody,
        is_read: false,
      })
      .select()
      .single();

    if (insertError || !message) {
      return { error: insertError?.message || 'Failed to send message', data: null };
    }

    // Determine recipient
    const recipientId = user.id === thread.buyer_id ? thread.seller_id : thread.buyer_id;

    // Create notification for recipient
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single();

    const messagePreview = filteredBody.substring(0, 50) + (filteredBody.length > 50 ? '...' : '');

    await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'new_message',
      payload: {
        thread_id: threadId,
        listing_id: thread.listing_id,
        sender_id: user.id,
        sender_name: senderProfile?.first_name || 'Someone',
        message_preview: messagePreview,
      },
    });

    return { error: null, data: message };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Get all messages in a thread
 */
export async function getMessages(threadId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Verify user is part of thread
    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .select('id, buyer_id, seller_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return { error: 'Thread not found', data: null };
    }

    if (user.id !== thread.buyer_id && user.id !== thread.seller_id) {
      return { error: 'Unauthorized', data: null };
    }

    // Get messages ordered by creation time
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        id,
        thread_id,
        sender_id,
        body,
        is_read,
        created_at,
        profiles:sender_id (first_name, last_initial)
      `
      )
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return { error: messagesError.message, data: null };
    }

    return { error: null, data: messages || [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Get all threads (inbox) for current user
 */
export async function getThreads() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    const { data: threads, error } = await supabase
      .from('message_threads')
      .select(
        `
        id,
        listing_id,
        buyer_id,
        seller_id,
        created_at,
        last_message_at,
        listings (id, title, images),
        buyer:buyer_id (first_name, last_initial),
        seller:seller_id (first_name, last_initial),
        messages (body, created_at, sender_id, is_read)
      `
      )
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      return { error: error.message, data: null };
    }

    // Add unread count to each thread
    const threadsWithUnread = (threads || []).map((thread: any) => {
      const otherParticipantId = user.id === thread.buyer_id ? thread.seller_id : thread.buyer_id;
      const unreadCount = (thread.messages || []).filter(
        (msg: any) => msg.sender_id === otherParticipantId && !msg.is_read
      ).length;

      return {
        ...thread,
        unreadCount,
        otherParticipantName:
          user.id === thread.buyer_id
            ? `${thread.seller.first_name} ${thread.seller.last_initial || ''}`
            : `${thread.buyer.first_name} ${thread.buyer.last_initial || ''}`,
        lastMessage: thread.messages?.[thread.messages.length - 1]?.body || 'No messages',
      };
    });

    return { error: null, data: threadsWithUnread };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Mark all messages in a thread as read for current user
 */
export async function markThreadAsRead(threadId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Verify user is in thread
    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .select('id, buyer_id, seller_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return { error: 'Thread not found', data: null };
    }

    if (user.id !== thread.buyer_id && user.id !== thread.seller_id) {
      return { error: 'Unauthorized', data: null };
    }

    // Mark other user's messages as read
    const otherUserId = user.id === thread.buyer_id ? thread.seller_id : thread.buyer_id;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('thread_id', threadId)
      .eq('sender_id', otherUserId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

/**
 * Get unread message count for current user
 */
export async function getUnreadMessageCount() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    // Count unread messages in threads where user is a participant
    const { data: count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .inFilter(
        'thread_id',
        (
          await supabase
            .from('message_threads')
            .select('id')
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        ).data?.map((t: any) => t.id) || []
      )
      .not('sender_id', 'eq', user.id)
      .eq('is_read', false);

    if (error) {
      return { error: error.message, data: null };
    }

    return { error: null, data: count || 0 };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Report a message
 */
export async function reportMessage(messageId: string, reason: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    if (!reason || reason.trim().length === 0) {
      return { error: 'Reason is required', data: null };
    }

    // Get the message to find target user
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, sender_id, thread_id')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return { error: 'Message not found', data: null };
    }

    // Create report
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_type: 'message',
        target_id: messageId,
        reason: reason.trim(),
      })
      .select()
      .single();

    if (error || !report) {
      return { error: error?.message || 'Failed to create report', data: null };
    }

    return { error: null, data: report };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}

/**
 * Report a user
 */
export async function reportUser(userId: string, reason: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated', data: null };
    }

    if (user.id === userId) {
      return { error: 'Cannot report yourself', data: null };
    }

    if (!reason || reason.trim().length === 0) {
      return { error: 'Reason is required', data: null };
    }

    // Create report
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_type: 'user',
        target_id: userId,
        reason: reason.trim(),
      })
      .select()
      .single();

    if (error || !report) {
      return { error: error?.message || 'Failed to create report', data: null };
    }

    return { error: null, data: report };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred', data: null };
  }
}
