-- Enable RLS on user_schedules table
ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;

-- Users can read their own schedules
CREATE POLICY IF NOT EXISTS "Users can read their own schedules" ON user_schedules
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own schedules
CREATE POLICY IF NOT EXISTS "Users can insert their own schedules" ON user_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own schedules
CREATE POLICY IF NOT EXISTS "Users can update their own schedules" ON user_schedules
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own schedules
CREATE POLICY IF NOT EXISTS "Users can delete their own schedules" ON user_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on courses table
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Students can read courses from their school
CREATE POLICY IF NOT EXISTS "Users can read courses from their school" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.school_id = courses.school_id
    )
  );

-- Only admins can insert courses
CREATE POLICY IF NOT EXISTS "Only admins can insert courses" ON courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Only admins can update courses
CREATE POLICY IF NOT EXISTS "Only admins can update courses" ON courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Only admins can delete courses
CREATE POLICY IF NOT EXISTS "Only admins can delete courses" ON courses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_schedules_user_id ON user_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_schedules_created_at ON user_schedules(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_school_id ON courses(school_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
