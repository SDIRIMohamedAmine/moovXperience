-- Fix: Drop the recursive admin update policy that causes deadlock
-- The "Users can update own profile" policy already covers self-updates
-- Admins can use the server-side service role key which bypasses RLS
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
