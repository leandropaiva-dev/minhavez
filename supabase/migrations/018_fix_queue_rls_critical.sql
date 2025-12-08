-- ============================================================================
-- FIX CRITICAL: Queue Entries RLS Vulnerability
-- Issue: USING (true) allows anyone to read ALL queue entries from ALL businesses
-- Impact: Cross-tenant data leak, LGPD/GDPR violation
-- ============================================================================

-- Remove the permissive policy
DROP POLICY IF EXISTS "Anyone can view their own queue entry" ON public.queue_entries;

-- Business owners can view their queue entries
CREATE POLICY "Business owner can view queue entries"
  ON public.queue_entries FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Super admins can view all queue entries
CREATE POLICY "Super admin can view all queue entries"
  ON public.queue_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Public can still insert (join queue) but not read all entries
-- The existing "Anyone can join queue" policy for INSERT remains unchanged
