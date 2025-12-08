-- ============================================================================
-- FIX CRITICAL: Conversion Funnels Policy
-- Issue: FOR ALL WITH CHECK (true) allows DELETE/UPDATE by anyone
-- Impact: Users can manipulate or delete analytics of other businesses
-- ============================================================================

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Anyone can insert/update conversion funnels" ON conversion_funnels;

-- Allow only INSERT for public tracking (anonymous visitors)
CREATE POLICY "Anyone can insert conversion funnels"
  ON conversion_funnels FOR INSERT
  WITH CHECK (true);

-- Business owners can update their own funnels
CREATE POLICY "Business owners can update their conversion funnels"
  ON conversion_funnels FOR UPDATE
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

-- Business owners can delete their own funnels
CREATE POLICY "Business owners can delete their conversion funnels"
  ON conversion_funnels FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Super admins can do everything (already covered by existing policies)
