-- ============================================
-- Reviews & Full-text search
-- ============================================

-- Average rating view (aggregates reviews per product)
CREATE OR REPLACE VIEW product_ratings AS
SELECT
  product_id,
  ROUND(AVG(rating), 1) as avg_rating,
  COUNT(*) as review_count
FROM reviews
GROUP BY product_id;

-- Full-text search column on products
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate existing products
UPDATE products SET search_vector =
  to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, ''));

-- Auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION products_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('french', coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_search_update ON products;
CREATE TRIGGER products_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_trigger();

-- GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);
