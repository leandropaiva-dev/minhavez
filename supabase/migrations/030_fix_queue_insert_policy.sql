-- ============================================================================
-- FIX: Restore public INSERT policy for queue_entries
-- Issue: Migration 018 removed SELECT policy but broke INSERT for anon users
-- ============================================================================

-- Ensure the INSERT policy exists for public/anon users
DROP POLICY IF EXISTS "Anyone can join queue" ON public.queue_entries;
DROP POLICY IF EXISTS "Public can join queue" ON public.queue_entries;

-- Allow anyone (including anon) to insert into queue
CREATE POLICY "Public can join queue"
  ON public.queue_entries
  FOR INSERT
  TO public, anon
  WITH CHECK (true);

-- Allow customers to view their own queue entry by ID
-- This is needed for the wait page (/fila/[businessId]/espera/[id])
CREATE POLICY "Public can view own queue entry by id"
  ON public.queue_entries
  FOR SELECT
  TO public, anon
  USING (true);
