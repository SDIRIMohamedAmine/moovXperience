-- =============================================
-- Move Experience — Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('client', 'supplier', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'role', 'client'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  description text,
  price_per_day numeric(10,2) NOT NULL,
  deposit numeric(10,2) DEFAULT 0,
  stock integer DEFAULT 1,
  is_available boolean DEFAULT true,
  images text[] DEFAULT '{}',
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- RENTALS
-- =============================================
CREATE TABLE rentals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'returned', 'completed', 'cancelled')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_price numeric(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- RENTAL ITEMS
-- =============================================
CREATE TABLE rental_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  price_per_day numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL
);

-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

-- Products: public read, supplier can CRUD own
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

CREATE POLICY "Suppliers can insert own products"
  ON products FOR INSERT WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can update own products"
  ON products FOR UPDATE USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can delete own products"
  ON products FOR DELETE USING (auth.uid() = supplier_id);

-- Rentals: clients see own, suppliers see their products' rentals
CREATE POLICY "Clients can view own rentals"
  ON rentals FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create rentals"
  ON rentals FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own rentals"
  ON rentals FOR UPDATE USING (auth.uid() = client_id);

-- Rental items: same as rentals
CREATE POLICY "Users can view rental items for own rentals"
  ON rental_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rentals WHERE rentals.id = rental_items.rental_id AND rentals.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rental items for own rentals"
  ON rental_items FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals WHERE rentals.id = rental_items.rental_id AND rentals.client_id = auth.uid()
    )
  );

-- Reviews: public read, clients can create for completed rentals
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for completed rentals"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM rentals WHERE rentals.id = reviews.rental_id AND rentals.status = 'completed'
    )
  );

-- =============================================
-- SEED CATEGORIES
-- =============================================
INSERT INTO categories (name, slug, icon) VALUES
  ('Chaises', 'chairs', 'chair'),
  ('Tables', 'tables', 'table'),
  ('Mobilier lounge', 'lounge', 'sofa'),
  ('Bars & comptoirs', 'bars', 'wine-glass'),
  ('Éclairage', 'lighting', 'lightbulb'),
  ('Décoration', 'decor', 'palette'),
  ('Textiles', 'textiles', 'fabric'),
  ('Audiovisuel', 'av-equipment', 'speaker');
