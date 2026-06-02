-- ============================================
-- Fix: Remove recursive RLS policy on profiles
-- The "Admins can view all profiles" policy
-- queries profiles inside itself, causing
-- infinite recursion and 500 errors.
-- ============================================

-- Drop the broken policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- The existing "Profiles are viewable by everyone" policy
-- already allows SELECT for all users, so admin access
-- is already covered. No replacement needed.

-- Also fix the admin update policy (same issue)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Recreate admin update policy using a SECURITY DEFINER function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin update policy using the function (no recursion)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());
