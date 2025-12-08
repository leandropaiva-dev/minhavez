-- ============================================================================
-- FIX HIGH: Reservation Schedule Policies
-- Issue: Policies reference non-existent column 'owner_id' instead of 'user_id'
-- Impact: RLS doesn't work, policies fail
-- ============================================================================

-- Drop all broken policies
DROP POLICY IF EXISTS "Users can view own business schedule" ON reservation_schedule;
DROP POLICY IF EXISTS "Users can insert own business schedule" ON reservation_schedule;
DROP POLICY IF EXISTS "Users can update own business schedule" ON reservation_schedule;
DROP POLICY IF EXISTS "Users can delete own business schedule" ON reservation_schedule;

-- Recreate with correct column name (user_id)

CREATE POLICY "Users can view own business schedule"
  ON reservation_schedule FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own business schedule"
  ON reservation_schedule FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own business schedule"
  ON reservation_schedule FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own business schedule"
  ON reservation_schedule FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Super admins can do everything
CREATE POLICY "Super admins can manage all schedules"
  ON reservation_schedule FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );
