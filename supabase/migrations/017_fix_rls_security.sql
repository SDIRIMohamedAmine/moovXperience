-- ============================================
-- Fix RLS security for production
-- ============================================

-- Drop the fully open policies
DROP POLICY IF EXISTS "Admin full access on products" ON products;
DROP POLICY IF EXISTS "Admin full access on quotes" ON quotes;

-- Products: public read, admin-only write
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can insert products" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update products" ON products FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can delete products" ON products FOR DELETE USING (is_admin());

-- Quotes: admin can read all, clients can read own, anyone can insert
CREATE POLICY "Admin can read all quotes" ON quotes FOR SELECT USING (is_admin());
CREATE POLICY "Clients can read own quotes" ON quotes FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Anyone can insert quotes" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update quotes" ON quotes FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can delete quotes" ON quotes FOR DELETE USING (is_admin());

-- Fix storage policies: require authentication
DROP POLICY IF EXISTS "Anyone can upload product media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product media" ON storage.objects;

CREATE POLICY "Authenticated can upload product media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete product media"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-media' AND auth.role() = 'authenticated');
