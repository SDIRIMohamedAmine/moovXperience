-- ============================================
-- Payment integration (Konnect)
-- ============================================
-- Add payment tracking columns to rentals table

ALTER TABLE rentals ADD COLUMN IF NOT EXISTS payment_ref text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Index for payment lookups
CREATE INDEX IF NOT EXISTS idx_rentals_payment_ref ON rentals(payment_ref);

-- Constraint: payment_status must be one of the valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_status'
  ) THEN
    ALTER TABLE rentals ADD CONSTRAINT check_payment_status
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;
