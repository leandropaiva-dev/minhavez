-- ============================================================================
-- FIX: Remove infinite recursion in businesses INSERT policy
-- Issue: Policy checks "NOT EXISTS (SELECT FROM businesses)" which creates
--        infinite recursion when trying to insert
-- Solution: Remove the EXISTS check - allow users to insert businesses
--           The application logic will handle the "one business per user" rule
-- ============================================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can create their own business" ON businesses;

-- Create new policy without recursion
CREATE POLICY "Users can create their own business"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: The "one business per user" constraint should be handled at the
-- application level, not in the database policy, to avoid recursion issues
