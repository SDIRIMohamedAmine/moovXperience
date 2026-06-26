-- ============================================
-- Fix admin role escalation vulnerability
-- Migration 007/018 overwrote the security fix from 002
-- by using COALESCE(raw_user_meta_data->>'role', 'client')
-- which allows anyone to register as admin.
-- This restores the CASE guard that blocks admin signup.
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone, company_name)
  VALUES (
    new.id,
    CASE
      WHEN new.raw_user_meta_data->>'role' = 'supplier' THEN 'supplier'
      ELSE 'client'
    END,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
