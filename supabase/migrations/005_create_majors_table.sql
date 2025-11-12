-- Create majors table
CREATE TABLE IF NOT EXISTS majors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_majors_is_active ON majors(is_active);
CREATE INDEX idx_majors_name ON majors(name);

-- Enable RLS
ALTER TABLE majors ENABLE ROW LEVEL SECURITY;

-- Anyone can read active majors
CREATE POLICY "Anyone can read active majors" ON majors
  FOR SELECT USING (is_active = TRUE);

-- Only admins can insert majors
CREATE POLICY "Only admins can insert majors" ON majors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Only admins can update majors
CREATE POLICY "Only admins can update majors" ON majors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Only admins can delete majors
CREATE POLICY "Only admins can delete majors" ON majors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );
