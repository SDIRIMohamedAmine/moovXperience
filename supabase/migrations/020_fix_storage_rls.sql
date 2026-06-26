-- ============================================
-- Fix storage RLS: restrict to admin only
-- Migration 017 used auth.role() = 'authenticated'
-- which allows ANY logged-in user to upload/delete.
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated can upload product media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete product media" ON storage.objects;

-- Admin-only upload
CREATE POLICY "Admin can upload product media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-media' AND is_admin());

-- Admin-only delete
CREATE POLICY "Admin can delete product media"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-media' AND is_admin());
