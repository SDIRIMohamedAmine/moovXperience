-- ============================================
-- Delivery location for rentals
-- ============================================
-- Store delivery address as JSON with text + coordinates

ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_address jsonb;

-- Index removed: GIN index on jsonb not required for this use case
-- Can add later if geo-queries are needed
