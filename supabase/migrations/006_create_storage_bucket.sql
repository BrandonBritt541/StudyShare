-- Create storage bucket for listing images
-- Note: This is created via Supabase dashboard, not SQL
-- See README for manual setup steps

-- Enable RLS on storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- Allow public read, authenticated upload/delete own files
-- CREATE POLICY "Public can read images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'listing-images');

-- CREATE POLICY "Users can upload images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'listing-images' AND
--     auth.role() = 'authenticated'
--   );

-- CREATE POLICY "Users can delete own images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'listing-images' AND
--     auth.uid() = owner
--   );
