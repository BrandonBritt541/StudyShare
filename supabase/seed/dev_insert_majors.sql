-- Dev seed script: Insert common majors
-- NOTE: This is for development only. Run manually in SQL Editor if needed.
-- DO NOT run in production.

INSERT INTO majors (name, is_active) VALUES
  ('Accounting', TRUE),
  ('Architecture', TRUE),
  ('Art & Design', TRUE),
  ('Biology', TRUE),
  ('Business', TRUE),
  ('Chemistry', TRUE),
  ('Civil Engineering', TRUE),
  ('Communication', TRUE),
  ('Computer Science', TRUE),
  ('Economics', TRUE),
  ('Electrical Engineering', TRUE),
  ('English', TRUE),
  ('Finance', TRUE),
  ('Industrial Engineering', TRUE),
  ('Marketing', TRUE),
  ('Mathematics', TRUE),
  ('Mechanical Engineering', TRUE),
  ('Packaging', TRUE),
  ('Psychology', TRUE),
  ('Sociology', TRUE)
ON CONFLICT (name) DO NOTHING;
