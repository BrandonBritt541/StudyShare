-- Add unique constraint on referred_user_id to prevent multiple redemptions
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS uniq_referred_user_id;
ALTER TABLE referrals ADD CONSTRAINT uniq_referred_user_id UNIQUE (referred_user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

-- Create events table for tracking important actions
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes on events
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- RLS Policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users can read their own events
CREATE POLICY IF NOT EXISTS "Users can read their own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all events
CREATE POLICY IF NOT EXISTS "Admins can read all events" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- System can insert events (allow all for now, will be called from server actions)
CREATE POLICY IF NOT EXISTS "System can insert events" ON events
  FOR INSERT WITH CHECK (TRUE);

-- Update referrals RLS policies to ensure users can't view who referred them
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can read their referrals" ON referrals;
DROP POLICY IF EXISTS "Users can create referrals for themselves" ON referrals;

-- New policies: Only the referrer can see their referrals, admins see all
CREATE POLICY IF NOT EXISTS "Referrers can read their own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_user_id);

CREATE POLICY IF NOT EXISTS "Admins can read all referrals" ON referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Only system (server action) can insert referrals
CREATE POLICY IF NOT EXISTS "System can insert referrals" ON referrals
  FOR INSERT WITH CHECK (TRUE);
