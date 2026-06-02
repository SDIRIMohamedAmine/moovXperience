-- ============================================
-- Security fixes for profiles table
-- ============================================

-- 1. Prevent role escalation: block role updates except by admins
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update ON profiles;
CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();

-- 2. Restrict signup role to client/supplier only (block admin)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, CASE
    WHEN new.raw_user_meta_data->>'role' = 'supplier' THEN 'supplier'
    ELSE 'client'
  END);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Add admin RLS policies (IF NOT EXISTS pattern)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update all profiles') THEN
    CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage products') THEN
    CREATE POLICY "Admins can manage products" ON products FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage rentals') THEN
    CREATE POLICY "Admins can manage rentals" ON rentals FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage reviews') THEN
    CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;

-- 4. Allow suppliers to update rental status for their products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can update rentals for their products') THEN
    CREATE POLICY "Suppliers can update rentals for their products" ON rentals FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM rental_items
      JOIN products ON products.id = rental_items.product_id
      WHERE rental_items.rental_id = rentals.id
      AND products.supplier_id = auth.uid()
    ));
  END IF;
END $$;
