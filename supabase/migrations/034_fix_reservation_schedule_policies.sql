-- Fix reservation_schedule RLS policies to use user_id instead of owner_id
-- Drop old policies
DROP POLICY IF EXISTS "Users can view own business schedule" ON reservation_schedule;
DROP POLICY IF EXISTS "Users can insert own business schedule" ON reservation_schedule;
DROP POLICY IF EXISTS "Users can update own business schedule" ON reservation_schedule;
DROP POLICY IF EXISTS "Users can delete own business schedule" ON reservation_schedule;

-- Create new policies with correct column name (user_id)
CREATE POLICY "Users can view own reservation schedule"
  ON reservation_schedule FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reservation schedule"
  ON reservation_schedule FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reservation schedule"
  ON reservation_schedule FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reservation schedule"
  ON reservation_schedule FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Super admin can view all schedules
CREATE POLICY "Super admin can view all reservation schedules"
  ON reservation_schedule FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Public can view schedules (needed for checking if reservations are open)
CREATE POLICY "Public can view reservation schedules"
  ON reservation_schedule FOR SELECT
  TO public, anon
  USING (true);
