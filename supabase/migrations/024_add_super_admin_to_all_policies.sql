-- ============================================================================
-- SECURITY: Add Super Admin bypass to ALL RLS policies
-- Ensures super admins have full access for support and debugging
-- ============================================================================

-- BUSINESSES TABLE
-- Super admins can view all businesses
CREATE POLICY "Super admin can view all businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- RESERVATIONS TABLE
CREATE POLICY "Super admin can manage all reservations"
  ON reservations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- FORM_CONFIGURATIONS TABLE
CREATE POLICY "Super admin can manage all form configurations"
  ON form_configurations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- LINK_PAGES TABLE
CREATE POLICY "Super admin can manage all link pages"
  ON link_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- LINK_PAGE_LINKS TABLE
CREATE POLICY "Super admin can manage all link page links"
  ON link_page_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- USER_ACTIVITY TABLE (already has super admin policy)
-- BUSINESS_METRICS TABLE (already has super admin policy)
-- ANALYTICS_EVENTS TABLE (already has super admin policy)
-- CONVERSION_FUNNELS TABLE (already has super admin policy from fix)

-- Note: queue_entries and reservations super admin policies were added in previous fixes
