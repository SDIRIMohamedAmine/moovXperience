-- ============================================
-- Remove supplier_id from products and quotes
-- All managed by admin now
-- ============================================

-- Drop RLS policies that reference supplier_id
DROP POLICY IF EXISTS "Suppliers can insert own products" ON products;
DROP POLICY IF EXISTS "Suppliers can update own products" ON products;
DROP POLICY IF EXISTS "Suppliers can delete own products" ON products;
DROP POLICY IF EXISTS "Products: suppliers manage own" ON products;
DROP POLICY IF EXISTS "Admins can read all rentals" ON rentals;
DROP POLICY IF EXISTS "Suppliers can view own quotes" ON quotes;
DROP POLICY IF EXISTS "Suppliers can update own quotes" ON quotes;

-- Drop indexes
DROP INDEX IF EXISTS idx_products_supplier;
DROP INDEX IF EXISTS idx_quotes_supplier;

-- Remove from products
ALTER TABLE products DROP COLUMN IF EXISTS supplier_id;

-- Remove from quotes
ALTER TABLE quotes DROP COLUMN IF EXISTS supplier_id;

-- Open policies for products (admin auth handled in-app)
DROP POLICY IF EXISTS "Admin full access on products" ON products;
CREATE POLICY "Admin full access on products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Open policies for quotes
DROP POLICY IF EXISTS "Admin full access on quotes" ON quotes;
CREATE POLICY "Admin full access on quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);
