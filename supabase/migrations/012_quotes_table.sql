-- ============================================
-- Phase 3: Quotes table for smart quote requests
-- ============================================

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES products(id),
  client_id uuid REFERENCES profiles(id),
  supplier_id uuid NOT NULL REFERENCES profiles(id),

  -- Contact info
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  company_name text,

  -- Quote details
  mode text NOT NULL CHECK (mode IN ('rental', 'purchase')),
  duration_days integer,
  options jsonb DEFAULT '[]',

  -- Event info
  event_date date,
  event_location text,
  notes text,

  -- Pricing
  estimated_total numeric(10,2),

  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier ON quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quotes_product ON quotes(product_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Clients can see their own quotes
CREATE POLICY "Clients can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = client_id);

-- Suppliers can see quotes for their products
CREATE POLICY "Suppliers can view quotes for their products" ON quotes
  FOR SELECT USING (auth.uid() = supplier_id);

-- Anyone authenticated can create quotes
CREATE POLICY "Authenticated users can create quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Suppliers can update quote status
CREATE POLICY "Suppliers can update quotes" ON quotes
  FOR UPDATE USING (auth.uid() = supplier_id);
