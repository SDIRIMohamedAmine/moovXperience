-- ============================================
-- Phase 3: Rental availability improvements
-- ============================================

-- Add delivery_address for future scalability
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_address text;

-- Index for availability queries (date range overlap checks)
CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rentals(start_date, end_date);
