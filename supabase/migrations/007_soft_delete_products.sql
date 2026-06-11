-- ============================================
-- Soft delete for products
-- ============================================
-- Add deleted_at column to support soft delete
-- Products with deleted_at IS NOT NULL are considered deleted

ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Index for filtering deleted products
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- Update auth trigger to pass full_name and phone
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
