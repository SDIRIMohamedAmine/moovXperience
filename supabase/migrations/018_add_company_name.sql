-- ============================================
-- Add company_name to profiles and update trigger
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update trigger to save company_name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone, company_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
