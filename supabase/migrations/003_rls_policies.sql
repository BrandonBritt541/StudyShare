-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Schools: Anyone can read, only admins can modify
CREATE POLICY "Schools are readable by everyone" ON schools
  FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can insert schools" ON schools
  FOR INSERT WITH CHECK (FALSE);

CREATE POLICY "Only admins can update schools" ON schools
  FOR UPDATE USING (FALSE);

-- Profiles: Users can read their own profile and profiles from same school
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read profiles from their school" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS p1
      WHERE p1.id = auth.uid()
        AND p1.school_id = profiles.school_id
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS p1
      WHERE p1.id = auth.uid() AND p1.role IN ('admin', 'moderator')
    )
  );

-- Listings: Users can see listings from their school
CREATE POLICY "Users can read listings from their school" ON listings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = listings.school_id
    )
  );

CREATE POLICY "Users can insert listings in their school" ON listings
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = listings.school_id
    )
  );

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = seller_id);

-- Message threads: Users can see their own threads
CREATE POLICY "Users can read their message threads" ON message_threads
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

CREATE POLICY "Users can create message threads" ON message_threads
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Messages: Users can read messages in their threads
CREATE POLICY "Users can read messages in their threads" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
        AND (message_threads.buyer_id = auth.uid()
          OR message_threads.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their threads" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = thread_id
        AND (message_threads.buyer_id = auth.uid()
          OR message_threads.seller_id = auth.uid())
    )
  );

-- Alerts: Users can see their own alerts
CREATE POLICY "Users can read their own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create alerts in their school" ON alerts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = alerts.school_id
    )
  );

CREATE POLICY "Users can delete their own alerts" ON alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications: Users can read their own notifications
CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark notifications as read" ON notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- User schedules: Users can see their own schedules and same school schedules
CREATE POLICY "Users can read their own schedules" ON user_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert schedules" ON user_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON user_schedules
  FOR UPDATE USING (auth.uid() = user_id);

-- Courses: Anyone from a school can read courses
CREATE POLICY "Users can read courses from their school" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = courses.school_id
    )
  );

CREATE POLICY "Only admins can insert courses" ON courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Reports: Users can create reports, admins can manage
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read their own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can read all reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Referrals: Users can read referral information related to them
CREATE POLICY "Users can read their referrals" ON referrals
  FOR SELECT USING (
    auth.uid() = referrer_user_id OR auth.uid() = referred_user_id
  );

CREATE POLICY "Users can create referrals for themselves" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referred_user_id);
