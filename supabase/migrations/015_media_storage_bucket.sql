-- ============================================
-- Media Storage Bucket for Products
-- ============================================

-- Create the bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for product media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product media" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read access for product media"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

-- Allow anyone to upload (bucket is public, admin uses custom auth)
CREATE POLICY "Anyone can upload product media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-media');

-- Allow anyone to delete (admin manages all media)
CREATE POLICY "Anyone can delete product media"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-media');
