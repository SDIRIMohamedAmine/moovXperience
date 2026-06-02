-- ============================================
-- Marketplace événementiel — Initial schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('client', 'supplier', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price_per_day numeric(10,2) NOT NULL CHECK (price_per_day >= 0),
  deposit numeric(10,2) DEFAULT 0 CHECK (deposit >= 0),
  stock integer DEFAULT 1 CHECK (stock >= 0),
  is_available boolean DEFAULT true,
  images text[] DEFAULT '{}',
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE rentals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'returned', 'completed', 'cancelled')),
  start_date date NOT NULL,
  end_date date NOT NULL CHECK (end_date >= start_date),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE rental_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_per_day numeric(10,2) NOT NULL CHECK (price_per_day >= 0),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES — PROFILES
-- ============================================

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES — CATEGORIES
-- ============================================

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES — PRODUCTS
-- ============================================

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Suppliers can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = supplier_id);

-- ============================================
-- RLS POLICIES — RENTALS
-- ============================================

CREATE POLICY "Users can view own rentals"
  ON rentals FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Users can create own rentals"
  ON rentals FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own rentals"
  ON rentals FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Suppliers can view rentals for their products"
  ON rentals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rental_items
      JOIN products ON products.id = rental_items.product_id
      WHERE rental_items.rental_id = rentals.id
      AND products.supplier_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES — RENTAL ITEMS
-- ============================================

CREATE POLICY "Users can view rental items for own rentals"
  ON rental_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rentals WHERE rentals.id = rental_id AND rentals.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rental items for own rentals"
  ON rental_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals WHERE rentals.id = rental_id AND rentals.client_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can view rental items for their products"
  ON rental_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products WHERE products.id = product_id AND products.supplier_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES — REVIEWS
-- ============================================

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert reviews for completed rentals"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_id
      AND rentals.client_id = auth.uid()
      AND rentals.status = 'completed'
    )
  );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_rentals_client ON rentals(client_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rental_items_rental ON rental_items(rental_id);
CREATE INDEX idx_rental_items_product ON rental_items(product_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_client ON reviews(client_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'role', 'client'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
