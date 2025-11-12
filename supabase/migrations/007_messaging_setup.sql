-- Add is_read column to messages table if not present
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Add unique constraint on message_threads (one thread per buyer-listing pair)
-- Drop if exists to avoid conflicts
ALTER TABLE message_threads DROP CONSTRAINT IF EXISTS uniq_thread_per_buyer_listing;

ALTER TABLE message_threads
ADD CONSTRAINT uniq_thread_per_buyer_listing UNIQUE (buyer_id, listing_id);

-- Update trigger to maintain last_message_at on message insert
-- This replaces the existing update_thread_last_message function
CREATE OR REPLACE FUNCTION bump_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if it exists with different name
DROP TRIGGER IF EXISTS trg_messages_update_thread_timestamp ON messages;

-- Create new trigger with bump name
CREATE TRIGGER trg_messages_bump
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION bump_thread_timestamp();

-- Add index on message_threads for faster lookups
CREATE INDEX IF NOT EXISTS idx_message_threads_buyer_id ON message_threads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_seller_id ON message_threads(seller_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message ON message_threads(last_message_at DESC);

-- Add index on messages for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Add index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_is_read_thread ON messages(thread_id, is_read);

-- RLS Policies for message_threads
-- Enable RLS if not already enabled
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

-- Users can read threads they're part of
CREATE POLICY IF NOT EXISTS "Users can read their message threads" ON message_threads
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Users can create message threads
CREATE POLICY IF NOT EXISTS "Users can create message threads" ON message_threads
  FOR INSERT WITH CHECK (
    (auth.uid() = buyer_id OR auth.uid() = seller_id) AND
    buyer_id != seller_id
  );

-- RLS Policies for messages
-- Enable RLS if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages in their threads
CREATE POLICY IF NOT EXISTS "Users can read messages in their threads" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
        AND (message_threads.buyer_id = auth.uid()
          OR message_threads.seller_id = auth.uid())
    )
  );

-- Users can insert messages in their threads
CREATE POLICY IF NOT EXISTS "Users can insert messages in their threads" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = thread_id
        AND (message_threads.buyer_id = auth.uid()
          OR message_threads.seller_id = auth.uid())
    )
  );

-- Users can update message read status in their threads
CREATE POLICY IF NOT EXISTS "Users can update read status in their threads" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
        AND (message_threads.buyer_id = auth.uid()
          OR message_threads.seller_id = auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
        AND (message_threads.buyer_id = auth.uid()
          OR message_threads.seller_id = auth.uid())
    )
  );
